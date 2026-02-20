import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { SubmitTurnInputSchema } from "@/application/dtos/dialogue-input";
import { handleError } from "../../../../_shared/error-handler";

export const dynamic = "force-dynamic";

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
    const input = SubmitTurnInputSchema.parse({
      sessionId: id,
      participantId: sessionId,
      content: body.content,
    });

    const container = getContainer();

    // Use agent-aware use case for all sessions
    // It detects agent sessions internally and generates agent responses
    const result = await container.submitAgentDialogueTurnUseCase.execute(
      input.sessionId,
      input.participantId,
      input.content,
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
