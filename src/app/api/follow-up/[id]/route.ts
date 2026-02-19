import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { avoidanceReduction } = body;

    if (
      typeof avoidanceReduction !== "number" ||
      avoidanceReduction < 1 ||
      avoidanceReduction > 5
    ) {
      return NextResponse.json(
        { error: "avoidanceReduction must be between 1 and 5" },
        { status: 400 },
      );
    }

    // TODO: Wire to DI container when Supabase is connected
    return NextResponse.json({
      success: true,
      checkinId: id,
      avoidanceReduction,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
