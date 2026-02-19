import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { SubmitReflectionInputSchema } from "@/application/dtos/reflection-input";
import { handleError } from "../../../../_shared/error-handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing X-Session-Id header" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const input = SubmitReflectionInputSchema.parse({
      ...body,
      sessionId: id,
      participantId: sessionId,
    });

    const container = getContainer();
    const result = await container.submitReflectionUseCase.execute(input);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.message },
        { status: 400 },
      );
    }
    return handleError(error);
  }
}
