import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { CreateProposalInputSchema } from "@/application/dtos/match-input";
import { handleError } from "../../_shared/error-handler";

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing X-Session-Id header" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const input = CreateProposalInputSchema.parse({
      initiatorSessionId: sessionId,
      targetSessionId: body.targetSessionId,
    });

    const container = getContainer();
    const proposal =
      await container.createMatchProposalUseCase.execute(
        input.initiatorSessionId,
        input.targetSessionId,
      );

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
