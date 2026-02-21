import { test as setup, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const AUTH_DIR = path.join(__dirname, ".auth");
const STORAGE_STATE_PATH = path.join(AUTH_DIR, "user.json");

setup.setTimeout(60_000);

setup("authenticate via Supabase", async ({ page }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!supabaseUrl || !supabaseKey || !email || !password) {
    console.warn(
      "Skipping auth setup: missing E2E env vars. " +
        "Authenticated tests will fail.",
    );
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    fs.writeFileSync(
      STORAGE_STATE_PATH,
      JSON.stringify({ cookies: [], origins: [] }),
    );
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    throw new Error(
      `Supabase auth failed: ${error?.message ?? "no session returned"}`,
    );
  }

  const { access_token, refresh_token } = data.session;

  // Navigate to the app so we can set cookies on the correct domain
  await page.goto("/");

  // Inject Supabase session cookies in the chunked format used by @supabase/ssr
  const baseUrl = new URL(supabaseUrl);
  const projectRef = baseUrl.hostname.split(".")[0];
  const cookiePrefix = `sb-${projectRef}-auth-token`;

  const tokenPayload = JSON.stringify({
    access_token,
    refresh_token,
    expires_at: data.session.expires_at,
    expires_in: data.session.expires_in,
    token_type: "bearer",
    type: "access",
    user: data.session.user,
  });

  // @supabase/ssr chunks cookies at ~3180 chars
  const CHUNK_SIZE = 3180;
  const chunks: string[] = [];
  for (let i = 0; i < tokenPayload.length; i += CHUNK_SIZE) {
    chunks.push(tokenPayload.slice(i, i + CHUNK_SIZE));
  }

  const cookies = chunks.map((chunk, index) => ({
    name: chunks.length === 1 ? cookiePrefix : `${cookiePrefix}.${index}`,
    value: chunk,
    domain: "localhost",
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "Lax" as const,
  }));

  await page.context().addCookies(cookies);

  // Verify auth worked by checking middleware doesn't redirect
  await page.goto("/friends");
  await expect(page).toHaveURL(/\/friends/);

  // Save storage state for authenticated tests
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
