import type { FollowUpCheckin } from "../entities/follow-up-checkin";

export interface FollowUpCheckinRepository {
  save(checkin: FollowUpCheckin): Promise<void>;
  findById(id: string): Promise<FollowUpCheckin | null>;
  findBySessionAndParticipant(
    sessionId: string,
    participantId: string,
  ): Promise<FollowUpCheckin | null>;
  findPendingByParticipant(participantId: string): Promise<FollowUpCheckin[]>;
  update(checkin: FollowUpCheckin): Promise<void>;
}
