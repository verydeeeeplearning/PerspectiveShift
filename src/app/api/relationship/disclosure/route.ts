import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { requireAuthUserId } from "@/infrastructure/config/auth-session";
import { handleError } from "../../_shared/error-handler";

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

    const container = getContainer();
    const result =
      await container.updateDisclosureLevelUseCase.execute(
        userId,
        body.friendshipId,
        body.targetUserId,
        body.level,
      );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    if (process.env.FEATURE_RELATIONSHIP !== "true") {
      return NextResponse.json(
        { error: "Feature disabled" },
        { status: 404 },
      );
    }

    const userId = await requireAuthUserId();
    const { searchParams } = new URL(request.url);
    const friendshipId = searchParams.get("friendshipId");

    if (!friendshipId) {
      return NextResponse.json(
        { error: "friendshipId query parameter required" },
        { status: 400 },
      );
    }

    const container = getContainer();
    const result =
      await container.getDisclosureLevelsUseCase.execute(
        userId,
        friendshipId,
      );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}
