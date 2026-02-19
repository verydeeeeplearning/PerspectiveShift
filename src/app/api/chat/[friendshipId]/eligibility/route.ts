import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ friendshipId: string }> },
) {
  try {
    const { friendshipId } = await params;

    if (!friendshipId) {
      return NextResponse.json(
        { error: "friendshipId is required" },
        { status: 400 },
      );
    }

    // TODO: Wire to DI container when Supabase is connected
    return NextResponse.json({
      eligible: false,
      reason: "구조화된 대화를 2회 이상 완료해야 합니다",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
