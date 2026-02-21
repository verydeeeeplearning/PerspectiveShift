import { cookies } from "next/headers";
import { AuthRequiredError } from "@/domain/errors/domain-errors";

const COOKIE_NAME = "ps_user_id";

export async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function requireAuthUserId(): Promise<string> {
  const userId = await getAuthUserId();
  if (!userId) {
    throw new AuthRequiredError();
  }
  return userId;
}
