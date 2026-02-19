import { NextResponse } from "next/server";
import { SubmitConfidenceInputSchema } from "@/application/dtos/confidence-input";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = SubmitConfidenceInputSchema.parse(body);

    // TODO: Wire to DI container when Supabase is connected
    return NextResponse.json({
      success: true,
      sessionId: input.sessionId,
      highConfidenceDimensions: input.highConfidenceDimensions,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
