import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { requireAuthUserId } from "@/infrastructure/config/auth-session";
import { RespondToOfflineProposalInputSchema } from "@/application/dtos/meeting-input";
import { handleError } from "../../../../_shared/error-handler";

export async function POST(
  request: NextRequest,
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
    const body = await request.json();
    const input = RespondToOfflineProposalInputSchema.parse(body);

    const container = getContainer();
    const result =
      await container.respondToOfflineProposalUseCase.execute(
        id,
        userId,
        input.action,
      );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}
