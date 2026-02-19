import { NextResponse } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { handleError } from "../../_shared/error-handler";
import type { ReviewChoice } from "@/domain/value-objects/review-response";

const VALID_CHOICES: ReviewChoice[] = ["changed", "unsure", "same"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { choice } = body;

    if (!choice || !VALID_CHOICES.includes(choice)) {
      return NextResponse.json(
        { error: "choice must be one of: changed, unsure, same" },
        { status: 400 },
      );
    }

    const container = getContainer();
    const result = await container.submitFollowUpCheckinUseCase.execute(id, choice as ReviewChoice);

    return NextResponse.json({
      success: true,
      checkinId: result.id,
      avoidanceReduction: result.avoidanceReduction,
      nextAction: result.nextAction,
      actionLabel: result.actionLabel,
      actionDescription: result.actionDescription,
    });
  } catch (error) {
    return handleError(error);
  }
}
