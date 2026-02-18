import type { FriendRepository } from "@/domain/interfaces/friend-repository";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { EventTracker } from "@/domain/interfaces/event-tracker";
import type { RespondToFriendRequestOutput } from "../dtos/friend-output";
import { Friendship } from "@/domain/entities/friendship";
import { RELATIONSHIP_EVENT_TYPES } from "@/domain/value-objects/relationship-event-type";
import {
  FriendRequestNotFoundError,
  UnauthorizedParticipantError,
} from "@/domain/errors/domain-errors";

export interface RespondToFriendRequestDeps {
  friendRepository: FriendRepository;
  friendshipRepository: FriendshipRepository;
  eventTracker?: EventTracker;
}

export class RespondToFriendRequestUseCase {
  private deps: RespondToFriendRequestDeps;

  constructor(deps: RespondToFriendRequestDeps) {
    this.deps = deps;
  }

  async execute(
    requestId: string,
    userId: string,
    action: "accept" | "decline" | "silent_reject",
  ): Promise<RespondToFriendRequestOutput> {
    const request =
      await this.deps.friendRepository.findById(requestId);
    if (!request) {
      throw new FriendRequestNotFoundError(requestId);
    }

    if (request.targetId !== userId) {
      throw new UnauthorizedParticipantError(userId);
    }

    let friendshipId: string | null = null;

    switch (action) {
      case "accept": {
        request.accept();

        const [userA, userB] = Friendship.normalizePair(
          request.requesterId,
          request.targetId,
        );
        const now = new Date();
        const friendship = Friendship.create({
          id: crypto.randomUUID(),
          userA,
          userB,
          status: "ACTIVE",
          dialogueCount: 1,
          createdAt: now,
          updatedAt: now,
        });

        await this.deps.friendshipRepository.save(friendship);
        friendshipId = friendship.id;
        break;
      }
      case "decline":
        request.decline();
        break;
      case "silent_reject":
        request.silentReject();
        break;
    }

    await this.deps.friendRepository.update(request);

    if (action === "accept" && friendshipId) {
      this.deps.eventTracker
        ?.track(RELATIONSHIP_EVENT_TYPES.FRIENDSHIP_CREATED, request.requesterId, request.targetId, { friendshipId })
        .catch(() => {});
    }

    return {
      requestId,
      status: request.status,
      friendshipId,
    };
  }
}
