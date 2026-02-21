import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "ps_user_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "이메일을 입력해주세요." },
        { status: 400 },
      );
    }

    const trimmed = email.trim().toLowerCase();
    const displayAlias = trimmed.split("@")[0];

    // Try to persist to Supabase (best-effort, non-blocking)
    try {
      const { getSupabaseClient } = await import(
        "@/infrastructure/persistence/supabase-client"
      );
      const client = getSupabaseClient();
      const now = new Date().toISOString();

      await client.from("user_profiles").upsert(
        {
          user_id: trimmed,
          display_alias: displayAlias,
          claimed_session_ids: [],
          created_at: now,
          updated_at: now,
        },
        { onConflict: "user_id" },
      );
    } catch {
      // DB not ready yet — login still succeeds
    }

    // Set cookie (this is what actually authenticates)
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, trimmed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({
      userId: trimmed,
      email: trimmed,
      displayAlias,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "로그인 실패" },
      { status: 500 },
    );
  }
}
