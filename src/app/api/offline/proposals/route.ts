import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { requireAuthUserId } from "@/infrastructure/config/auth-session";
import { CreateOfflineProposalInputSchema } from "@/application/dtos/meeting-input";
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
    const input = CreateOfflineProposalInputSchema.parse(body);

    const container = getContainer();
    const result =
      await container.createOfflineProposalUseCase.execute(
        userId,
        input.friendshipId,
        input.proposedAt,
        input.locationHint,
      );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
