import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { handleError } from "../../_shared/error-handler";

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
