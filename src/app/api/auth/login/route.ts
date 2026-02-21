import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseClient } from "@/infrastructure/persistence/supabase-client";

const COOKIE_NAME = "ps_user_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "이메일을 입력해주세요." }, { status: 400 });
    }

    const trimmed = email.trim().toLowerCase();
    const client = getSupabaseClient();

    // Check if user already exists
    const { data: existing } = await client
      .from("user_profiles")
      .select("user_id, display_alias")
      .eq("user_id", trimmed)
      .maybeSingle();

    if (!existing) {
      // Create new user
      const now = new Date().toISOString();
      const { error } = await client.from("user_profiles").insert({
        user_id: trimmed,
        display_alias: trimmed.split("@")[0],
        claimed_session_ids: [],
        created_at: now,
        updated_at: now,
      });

      if (error) {
        return NextResponse.json(
          { error: `유저 생성 실패: ${error.message}` },
          { status: 500 },
        );
      }
    }

    // Set cookie
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
      displayAlias: existing?.display_alias ?? trimmed.split("@")[0],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "로그인 실패" },
      { status: 500 },
    );
  }
}
