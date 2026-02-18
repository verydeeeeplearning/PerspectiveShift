import type { MeetingRepository } from "@/domain/interfaces/meeting-repository";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { OfflineMeetingOutput } from "../dtos/meeting-output";
import {
  MeetingNotFoundError,
  UnauthorizedParticipantError,
} from "@/domain/errors/domain-errors";

export interface RespondToOfflineProposalDeps {
  meetingRepository: MeetingRepository;
  friendshipRepository: FriendshipRepository;
}

export class RespondToOfflineProposalUseCase {
  private deps: RespondToOfflineProposalDeps;

  constructor(deps: RespondToOfflineProposalDeps) {
    this.deps = deps;
  }

  async execute(
    meetingId: string,
    userId: string,
    action: "confirm" | "cancel",
  ): Promise<OfflineMeetingOutput> {
    const meeting =
      await this.deps.meetingRepository.findById(meetingId);

    if (!meeting) {
      throw new MeetingNotFoundError(meetingId);
    }

    // Verify user is part of the friendship
    const friendship =
      await this.deps.friendshipRepository.findById(
        meeting.friendshipId,
      );
    if (!friendship || !friendship.isMember(userId)) {
      throw new UnauthorizedParticipantError(userId);
    }

    if (action === "confirm") {
      meeting.confirm();
    } else {
      meeting.cancel();
    }

    await this.deps.meetingRepository.update(meeting);

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
