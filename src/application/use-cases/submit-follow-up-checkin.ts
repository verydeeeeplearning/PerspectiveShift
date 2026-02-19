import type { FollowUpCheckinRepository } from "@/domain/interfaces/follow-up-checkin-repository";
import { ReviewResponse, type ReviewChoice, type ReviewNextAction } from "@/domain/value-objects/review-response";

export interface SubmitFollowUpCheckinDeps {
  followUpRepository: FollowUpCheckinRepository;
}

export interface FollowUpCheckinResult {
  id: string;
  avoidanceReduction: number;
  completedAt: string;
  nextAction: ReviewNextAction;
  actionLabel: string;
  actionDescription: string;
}

const CHOICE_TO_SCORE: Record<ReviewChoice, number> = {
  changed: 5,
  unsure: 3,
  same: 1,
};

export class SubmitFollowUpCheckinUseCase {
  constructor(private readonly deps: SubmitFollowUpCheckinDeps) {}

  async execute(checkinId: string, choice: ReviewChoice): Promise<FollowUpCheckinResult> {
    const checkin = await this.deps.followUpRepository.findById(checkinId);
    if (!checkin) {
      throw new Error(`Follow-up checkin ${checkinId} not found`);
    }

    if (checkin.isExpired(new Date())) {
      throw new Error(`Follow-up checkin ${checkinId} has expired`);
    }

    const avoidanceReduction = CHOICE_TO_SCORE[choice];
    const completed = checkin.submit(avoidanceReduction);
    await this.deps.followUpRepository.update(completed);

    const response = ReviewResponse.from(choice);

    return {
      id: completed.id,
      avoidanceReduction: completed.avoidanceReduction!,
      completedAt: completed.completedAt!.toISOString(),
      nextAction: response.nextAction,
      actionLabel: response.actionLabel,
      actionDescription: response.actionDescription,
    };
  }
}
