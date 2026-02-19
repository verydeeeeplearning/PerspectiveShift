import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // TODO: Wire to DI container when Supabase is connected
    return NextResponse.json({
      sessionId: id,
      agreedPoints: [],
      disagreedPoints: [],
      sharedQuestions: [],
      llmGenerated: false,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // TODO: Wire to DI container when Supabase is connected
    return NextResponse.json({
      success: true,
      sessionId: id,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
