import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { requireAuthUserId } from "@/infrastructure/config/auth-session";
import { handleError } from "../../../_shared/error-handler";

export async function GET(
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
    const { friendshipId } = await params;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);
    const before = searchParams.get("before");

    const container = getContainer();
    const result = await container.getChatHistoryUseCase.execute(
      friendshipId,
      userId,
      limit,
      before ? new Date(before) : undefined,
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}

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
    const { friendshipId } = await params;
    const body = await request.json();
    const content = body.content;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 },
      );
    }

    const container = getContainer();
    const result = await container.sendChatMessageUseCase.execute(
      friendshipId,
      userId,
      content,
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
