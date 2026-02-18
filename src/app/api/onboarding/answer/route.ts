import { NextResponse } from "next/server";
import { SubmitBatchInputSchema } from "@/application/dtos/submit-answer-input";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = SubmitBatchInputSchema.parse(body);

    return NextResponse.json({
      success: true,
      sessionId: input.sessionId,
      answersReceived: input.answers.length,
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
