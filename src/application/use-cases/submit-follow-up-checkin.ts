import type { FollowUpCheckinRepository } from "@/domain/interfaces/follow-up-checkin-repository";

export interface SubmitFollowUpCheckinDeps {
  followUpRepository: FollowUpCheckinRepository;
}

export interface FollowUpCheckinResult {
  id: string;
  avoidanceReduction: number;
  completedAt: string;
}

export class SubmitFollowUpCheckinUseCase {
  constructor(private readonly deps: SubmitFollowUpCheckinDeps) {}

  async execute(checkinId: string, avoidanceReduction: number): Promise<FollowUpCheckinResult> {
    const checkin = await this.deps.followUpRepository.findById(checkinId);
    if (!checkin) {
      throw new Error(`Follow-up checkin ${checkinId} not found`);
    }

    if (checkin.isExpired(new Date())) {
      throw new Error(`Follow-up checkin ${checkinId} has expired`);
    }

    const completed = checkin.submit(avoidanceReduction);
    await this.deps.followUpRepository.update(completed);

    return {
      id: completed.id,
      avoidanceReduction: completed.avoidanceReduction!,
      completedAt: completed.completedAt!.toISOString(),
    };
  }
}
