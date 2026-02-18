import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
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
    const accept = body.accept === true;

    const container = getContainer();
    const result = await container.respondToProposalUseCase.execute(
      id,
      sessionId,
      accept,
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}
