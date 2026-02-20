import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { handleError } from "../../_shared/error-handler";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing X-Session-Id header" },
        { status: 401 },
      );
    }

    const container = getContainer();
    const sessions =
      await container.getDialogueSessionUseCase.listByParticipant(
        sessionId,
      );

    return NextResponse.json({ sessions });
  } catch (error) {
    return handleError(error);
  }
}

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
    const candidateType =
      typeof body?.candidateType === "string" ? body.candidateType : null;
    const personaId =
      typeof body?.personaId === "string" ? body.personaId.trim() : "";

    if (candidateType !== "agent" && !personaId) {
      return NextResponse.json(
        {
          error:
            "Human matchmaking flow is unchanged. Use /api/matching/proposals for human candidates.",
        },
        { status: 400 },
      );
    }

    if (!personaId) {
      return NextResponse.json(
        { error: "personaId is required for agent session creation" },
        { status: 400 },
      );
    }

    const container = getContainer();
    const created =
      await container.createAgentDialogueSessionUseCase.execute({
        participantSessionId: sessionId,
        personaId,
      });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
