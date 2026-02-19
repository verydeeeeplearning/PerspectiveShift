import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { handleError } from "../../../../_shared/error-handler";

export async function GET(
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
    const container = getContainer();
    const summary =
      await container.generateSummaryCardUseCase.execute(id);

    return NextResponse.json(summary);
  } catch (error) {
    return handleError(error);
  }
}
