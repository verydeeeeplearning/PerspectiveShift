import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // TODO: Wire to DI container when Supabase is connected
    return NextResponse.json({
      id,
      friendshipId: "stub",
      type: "COMMON_GROUND",
      initiatorId: "stub",
      status: "ACTIVE",
      initiatorResponse: null,
      responderResponse: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
