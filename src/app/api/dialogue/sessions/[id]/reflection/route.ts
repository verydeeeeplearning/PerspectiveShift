import { NextResponse } from "next/server";
import { SubmitReflectionInputSchema } from "@/application/dtos/reflection-input";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input = SubmitReflectionInputSchema.parse({
      ...body,
      sessionId: id,
    });

    // TODO: Wire to DI container when Supabase is connected
    return NextResponse.json({
      success: true,
      sessionId: input.sessionId,
      participantId: input.participantId,
      itemCount: input.items.length,
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
