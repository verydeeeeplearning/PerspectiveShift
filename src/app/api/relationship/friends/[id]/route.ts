import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { requireAuthUserId } from "@/infrastructure/config/auth-session";
import { handleError } from "../../../_shared/error-handler";
import {
  FriendshipNotFoundError,
  UnauthorizedParticipantError,
} from "@/domain/errors/domain-errors";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (process.env.FEATURE_RELATIONSHIP !== "true") {
      return NextResponse.json(
        { error: "Feature disabled" },
        { status: 404 },
      );
    }

    const userId = await requireAuthUserId();
    const { id } = await params;

    const container = getContainer();
    const friendship =
      await container.friendshipRepository.findById(id);

    if (!friendship) {
      throw new FriendshipNotFoundError(id);
    }

    if (!friendship.isMember(userId)) {
      throw new UnauthorizedParticipantError(userId);
    }

    return NextResponse.json({
      id: friendship.id,
      friendUserId:
        friendship.userA === userId
          ? friendship.userB
          : friendship.userA,
      status: friendship.status,
      dialogueCount: friendship.dialogueCount,
      createdAt: friendship.createdAt.toISOString(),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (process.env.FEATURE_RELATIONSHIP !== "true") {
      return NextResponse.json(
        { error: "Feature disabled" },
        { status: 404 },
      );
    }

    const userId = await requireAuthUserId();
    const { id } = await params;

    const container = getContainer();
    await container.unfriendUseCase.execute(id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
