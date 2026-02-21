import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAuthClient } from "@/infrastructure/config/supabase-auth-client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/matching";

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/login?error=no_code", request.url),
    );
  }

  const supabase = await createSupabaseAuthClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(error.message)}`,
        request.url,
      ),
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
