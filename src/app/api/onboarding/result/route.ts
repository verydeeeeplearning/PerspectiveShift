import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateStance } from "@/app/(funnel)/onboarding/actions";

const ResultRequestSchema = z.object({
  sessionId: z.string().min(1),
  answers: z.record(
    z.string(),
    z.union([z.boolean(), z.number(), z.string()]),
  ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = ResultRequestSchema.parse(body);

    const result = await calculateStance(
      input.sessionId,
      input.answers as Record<number, boolean | number | string>,
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to calculate stance" },
      { status: 500 },
    );
  }
}
