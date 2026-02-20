import { NextResponse } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { requireAuthUserId } from "@/infrastructure/config/auth-session";
import { handleError } from "../../_shared/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (process.env.FEATURE_RELATIONSHIP !== "true") {
      return NextResponse.json({ friends: [] });
    }

    const userId = await requireAuthUserId();

    const container = getContainer();
    const friends = await container.listFriendsUseCase.execute(userId);

    return NextResponse.json({ friends });
  } catch (error) {
    return handleError(error);
  }
}
