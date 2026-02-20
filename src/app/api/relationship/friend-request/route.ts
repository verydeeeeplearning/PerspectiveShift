import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { requireAuthUserId } from "@/infrastructure/config/auth-session";
import { RequestFriendshipInputSchema } from "@/application/dtos/friend-input";
import { handleError } from "../../_shared/error-handler";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (process.env.FEATURE_RELATIONSHIP !== "true") {
      return NextResponse.json(
        { error: "Feature disabled" },
        { status: 404 },
      );
    }

    const userId = await requireAuthUserId();
    const body = await request.json();
    const input = RequestFriendshipInputSchema.parse(body);

    const container = getContainer();
    const result = await container.requestFriendshipUseCase.execute(
      userId,
      input.targetId,
      input.dialogueSessionId,
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(_request: NextRequest) {
  try {
    if (process.env.FEATURE_RELATIONSHIP !== "true") {
      return NextResponse.json(
        { error: "Feature disabled" },
        { status: 404 },
      );
    }

    const userId = await requireAuthUserId();

    const container = getContainer();
    const requests =
      await container.friendRepository.findPendingForUser(userId);

    const output = requests.map((r) => ({
      id: r.id,
      requesterId: r.requesterId,
      targetId: r.targetId,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({ requests: output });
  } catch (error) {
    return handleError(error);
  }
}
