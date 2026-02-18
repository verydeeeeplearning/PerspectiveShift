import type { FriendRepository } from "@/domain/interfaces/friend-repository";
import type { BlockRepository } from "@/domain/interfaces/block-repository";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { EventTracker } from "@/domain/interfaces/event-tracker";
import type { FriendRequestOutput } from "../dtos/friend-output";
import { FriendRequest } from "@/domain/entities/friend-request";
import { RELATIONSHIP_EVENT_TYPES } from "@/domain/value-objects/relationship-event-type";
import {
  CannotFriendSelfError,
  UserBlockedError,
  FriendRequestAlreadyExistsError,
  InsufficientDialogueHistoryError,
} from "@/domain/errors/domain-errors";

export interface RequestFriendshipDeps {
  friendRepository: FriendRepository;
  blockRepository: BlockRepository;
  dialogueRepository: DialogueRepository;
  eventTracker?: EventTracker;
}

export class RequestFriendshipUseCase {
  private deps: RequestFriendshipDeps;

  constructor(deps: RequestFriendshipDeps) {
    this.deps = deps;
  }

  async execute(
    requesterId: string,
    targetId: string,
    dialogueSessionId?: string,
  ): Promise<FriendRequestOutput> {
    if (requesterId === targetId) {
      throw new CannotFriendSelfError();
    }

    const blocked =
      await this.deps.blockRepository.isBlockedEitherDirection(
        requesterId,
        targetId,
      );
    if (blocked) {
      throw new UserBlockedError();
    }

    const existing = await this.deps.friendRepository.findPending(
      requesterId,
      targetId,
    );
    if (existing) {
      throw new FriendRequestAlreadyExistsError(requesterId, targetId);
    }

    // Verify at least one completed dialogue between the users
    const sessions =
      await this.deps.dialogueRepository.findSessionsByParticipant(
        requesterId,
      );
    const completedWithTarget = sessions.filter(
      (s) =>
        s.isComplete() && s.isParticipant(targetId),
    );
    if (completedWithTarget.length === 0) {
      throw new InsufficientDialogueHistoryError(1, 0);
    }

    const now = new Date();
    const request = FriendRequest.create({
      id: crypto.randomUUID(),
      requesterId,
      targetId,
      dialogueSessionId: dialogueSessionId ?? null,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    });

    await this.deps.friendRepository.save(request);

    this.deps.eventTracker
      ?.track(RELATIONSHIP_EVENT_TYPES.FRIEND_REQUEST_SENT, requesterId, targetId, { dialogueSessionId })
      .catch(() => {});

    return {
      id: request.id,
      requesterId: request.requesterId,
      targetId: request.targetId,
      status: request.status,
      createdAt: request.createdAt.toISOString(),
    };
  }
}
