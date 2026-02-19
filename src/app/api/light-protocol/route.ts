import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { friendshipId, initiatorId, type } = body;

    if (!friendshipId || !initiatorId || !type) {
      return NextResponse.json(
        { error: "friendshipId, initiatorId, and type are required" },
        { status: 400 },
      );
    }

    // TODO: Wire to DI container when Supabase is connected
    return NextResponse.json({
      id: crypto.randomUUID(),
      friendshipId,
      type,
      initiatorId,
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
