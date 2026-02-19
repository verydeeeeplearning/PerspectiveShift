import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { DisclosureRepository } from "@/domain/interfaces/disclosure-repository";
import type { MeetingRepository } from "@/domain/interfaces/meeting-repository";
import type { EventTracker } from "@/domain/interfaces/event-tracker";
import type { OfflineMeetingOutput } from "../dtos/meeting-output";
import { OfflineMeeting } from "@/domain/entities/offline-meeting";
import { RELATIONSHIP_EVENT_TYPES } from "@/domain/value-objects/relationship-event-type";
import {
  FriendshipNotFoundError,
  FriendshipNotActiveError,
  UnauthorizedParticipantError,
  MeetingConditionsNotMetError,
} from "@/domain/errors/domain-errors";

export interface CreateOfflineProposalDeps {
  friendshipRepository: FriendshipRepository;
  disclosureRepository: DisclosureRepository;
  meetingRepository: MeetingRepository;
  eventTracker?: EventTracker;
}

export class CreateOfflineProposalUseCase {
  private deps: CreateOfflineProposalDeps;

  constructor(deps: CreateOfflineProposalDeps) {
    this.deps = deps;
  }

  async execute(
    userId: string,
    friendshipId: string,
    proposedAt?: string,
    locationHint?: string,
  ): Promise<OfflineMeetingOutput> {
    const friendship =
      await this.deps.friendshipRepository.findById(friendshipId);

    if (!friendship) {
      throw new FriendshipNotFoundError(friendshipId);
    }

    if (!friendship.isMember(userId)) {
      throw new UnauthorizedParticipantError(userId);
    }

    if (!friendship.isActive()) {
      throw new FriendshipNotActiveError(friendshipId);
    }

    // Check dialogue count >= 3
    if (friendship.dialogueCount < 3) {
      throw new MeetingConditionsNotMetError(
        `최소 3회 대화 필요 (현재: ${friendship.dialogueCount}회)`,
      );
    }

    // Check disclosure level >= 2
    const otherUserId =
      friendship.userA === userId
        ? friendship.userB
        : friendship.userA;
    const disclosure =
      await this.deps.disclosureRepository.findByDirection(
        friendshipId,
        userId,
        otherUserId,
      );
    const currentLevel = disclosure?.level.value ?? 0;

    if (currentLevel < 2) {
      throw new MeetingConditionsNotMetError(
        `공개 레벨 2 이상 필요 (현재: ${currentLevel})`,
      );
    }

    const now = new Date();
    const meeting = OfflineMeeting.create({
      id: crypto.randomUUID(),
      friendshipId,
      proposerId: userId,
      status: "PROPOSED",
      safetyCheckinStatus: "PENDING",
      proposedAt: proposedAt ? new Date(proposedAt) : null,
      locationHint: locationHint ?? null,
      createdAt: now,
      updatedAt: now,
    });

    await this.deps.meetingRepository.save(meeting);

    this.deps.eventTracker
      ?.track(RELATIONSHIP_EVENT_TYPES.OFFLINE_PROPOSAL_CREATED, userId, null, { friendshipId })
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
