import type { FollowUpCheckinRepository } from "@/domain/interfaces/follow-up-checkin-repository";
import { FollowUpCheckin } from "@/domain/entities/follow-up-checkin";

export interface ScheduleFollowUpDeps {
  followUpRepository: FollowUpCheckinRepository;
}

export interface FollowUpScheduleResult {
  id: string;
  dialogueSessionId: string;
  participantId: string;
  scheduledAt: string;
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export class ScheduleFollowUpUseCase {
  constructor(private readonly deps: ScheduleFollowUpDeps) {}

  async execute(sessionId: string, participantId: string): Promise<FollowUpScheduleResult> {
    const existing = await this.deps.followUpRepository.findBySessionAndParticipant(
      sessionId,
      participantId,
    );
    if (existing) {
      throw new Error(`Follow-up already scheduled for session ${sessionId} participant ${participantId}`);
    }

    const now = new Date();
    const checkin = FollowUpCheckin.create({
      id: crypto.randomUUID(),
      dialogueSessionId: sessionId,
      participantId,
      scheduledAt: new Date(now.getTime() + ONE_WEEK_MS),
      avoidanceReduction: null,
      completedAt: null,
      createdAt: now,
    });

    await this.deps.followUpRepository.save(checkin);

    return {
      id: checkin.id,
      dialogueSessionId: checkin.dialogueSessionId,
      participantId: checkin.participantId,
      scheduledAt: checkin.scheduledAt.toISOString(),
    };
  }
}
