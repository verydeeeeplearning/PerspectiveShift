import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { requireAuthUserId } from "@/infrastructure/config/auth-session";
import { handleError } from "../../../_shared/error-handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ friendshipId: string }> },
) {
  try {
    if (process.env.FEATURE_RELATIONSHIP !== "true") {
      return NextResponse.json(
        { error: "Feature disabled" },
        { status: 404 },
      );
    }

    const userId = await requireAuthUserId();
    await params;
    const body = await request.json();
    const messageIds: string[] = body.messageIds;

    if (
      !Array.isArray(messageIds) ||
      messageIds.length === 0
    ) {
      return NextResponse.json(
        { error: "messageIds array is required" },
        { status: 400 },
      );
    }

    const container = getContainer();
    await container.markMessagesReadUseCase.execute(
      messageIds,
      userId,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
