import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, response } = body;

    if (!userId || !response) {
      return NextResponse.json(
        { error: "userId and response are required" },
        { status: 400 },
      );
    }

    // TODO: Wire to DI container when Supabase is connected
    return NextResponse.json({
      id,
      status: "ACTIVE",
      initiatorResponse: response,
      responderResponse: null,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
