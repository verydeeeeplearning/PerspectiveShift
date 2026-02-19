import type { MeetingRepository } from "@/domain/interfaces/meeting-repository";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { EventTracker } from "@/domain/interfaces/event-tracker";
import type { SafetyCheckinStatus } from "@/domain/value-objects/safety-checkin-status";
import type { OfflineMeetingOutput } from "../dtos/meeting-output";
import { RELATIONSHIP_EVENT_TYPES } from "@/domain/value-objects/relationship-event-type";
import {
  MeetingNotFoundError,
  UnauthorizedParticipantError,
} from "@/domain/errors/domain-errors";

export interface SubmitSafetyCheckinDeps {
  meetingRepository: MeetingRepository;
  friendshipRepository: FriendshipRepository;
  eventTracker?: EventTracker;
}

export class SubmitSafetyCheckinUseCase {
  private deps: SubmitSafetyCheckinDeps;

  constructor(deps: SubmitSafetyCheckinDeps) {
    this.deps = deps;
  }

  async execute(
    meetingId: string,
    userId: string,
    checkinStatus: SafetyCheckinStatus,
  ): Promise<OfflineMeetingOutput> {
    const meeting =
      await this.deps.meetingRepository.findById(meetingId);

    if (!meeting) {
      throw new MeetingNotFoundError(meetingId);
    }

    const friendship =
      await this.deps.friendshipRepository.findById(
        meeting.friendshipId,
      );
    if (!friendship || !friendship.isMember(userId)) {
      throw new UnauthorizedParticipantError(userId);
    }

    meeting.submitCheckin(checkinStatus);
    await this.deps.meetingRepository.update(meeting);

    this.deps.eventTracker
      ?.track(RELATIONSHIP_EVENT_TYPES.SAFETY_CHECKIN_SUBMITTED, userId, null, { meetingId, checkinStatus })
      .catch(() => {});

    return {
      id: meeting.id,
      friendshipId: meeting.friendshipId,
      proposerId: meeting.proposerId,
      status: meeting.status,
      safetyCheckinStatus: meeting.safetyCheckinStatus,
      proposedAt: meeting.proposedAt?.toISOString() ?? null,
      locationHint: meeting.locationHint,
      createdAt: meeting.createdAt.toISOString(),
    };
  }
}
