import { NextResponse } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { handleError } from "../_shared/error-handler";

export async function POST(request: Request) {
  try {
    const participantId = request.headers.get("x-session-id");
    if (!participantId) {
      return NextResponse.json(
        { error: "x-session-id header is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { sessionId } = body;
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 },
      );
    }

    const container = getContainer();
    const result = await container.scheduleFollowUpUseCase.execute(sessionId, participantId);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(request: Request) {
  try {
    const participantId = request.headers.get("x-session-id");
    if (!participantId) {
      return NextResponse.json(
        { error: "x-session-id header is required" },
        { status: 400 },
      );
    }

    const container = getContainer();
    const pending = await container.followUpRepository.findPendingByParticipant(participantId);

    return NextResponse.json(
      pending.map((checkin) => ({
        id: checkin.id,
        dialogueSessionId: checkin.dialogueSessionId,
        participantId: checkin.participantId,
        scheduledAt: checkin.scheduledAt.toISOString(),
      })),
    );
  } catch (error) {
    return handleError(error);
  }
}
