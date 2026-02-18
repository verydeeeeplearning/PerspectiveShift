import { createSupabaseAuthClient } from "./supabase-auth-client";
import { AuthRequiredError } from "@/domain/errors/domain-errors";

export async function getAuthUserId(): Promise<string | null> {
  const supabase = await createSupabaseAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function requireAuthUserId(): Promise<string> {
  const userId = await getAuthUserId();
  if (!userId) {
    throw new AuthRequiredError();
  }
  return userId;
}
