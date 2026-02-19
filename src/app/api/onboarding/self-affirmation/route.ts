import { NextResponse } from "next/server";
import { SubmitSelfAffirmationInputSchema } from "@/application/dtos/self-affirmation-input";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = SubmitSelfAffirmationInputSchema.parse(body);

    // TODO: Wire to DI container when Supabase is connected
    return NextResponse.json({
      success: true,
      sessionId: input.sessionId,
      coreValue: input.coreValue,
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
