import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { SubmitFeedbackInputSchema } from "@/application/dtos/feedback-input";
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
    const input = SubmitFeedbackInputSchema.parse({
      sessionId: id,
      participantId: sessionId,
      satisfaction: body.satisfaction,
      rematchWillingness: body.rematchWillingness,
      emotionCheckIn: body.emotionCheckIn ?? null,
    });

    const container = getContainer();
    const result = await container.submitFeedbackUseCase.execute(
      input.sessionId,
      input.participantId,
      input.satisfaction,
      input.rematchWillingness,
      input.emotionCheckIn,
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
