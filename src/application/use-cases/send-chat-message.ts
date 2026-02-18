import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { BlockRepository } from "@/domain/interfaces/block-repository";
import type { MessageRepository } from "@/domain/interfaces/message-repository";
import type { RealtimeBroadcaster } from "@/domain/interfaces/realtime-broadcaster";
import type { RateLimiter } from "@/domain/interfaces/rate-limiter";
import type { PiiScrubber } from "@/domain/interfaces/pii-scrubber";
import type { EventTracker } from "@/domain/interfaces/event-tracker";
import type { ChatMessageOutput } from "../dtos/chat-output";
import { ChatMessage } from "@/domain/entities/chat-message";
import { RELATIONSHIP_EVENT_TYPES } from "@/domain/value-objects/relationship-event-type";
import {
  FriendshipNotFoundError,
  FriendshipNotActiveError,
  UnauthorizedParticipantError,
  UserBlockedError,
  RateLimitExceededError,
} from "@/domain/errors/domain-errors";

export interface SendChatMessageDeps {
  friendshipRepository: FriendshipRepository;
  blockRepository: BlockRepository;
  messageRepository: MessageRepository;
  realtimeBroadcaster: RealtimeBroadcaster;
  rateLimiter: RateLimiter;
  piiScrubber: PiiScrubber;
  eventTracker?: EventTracker;
}

export class SendChatMessageUseCase {
  private deps: SendChatMessageDeps;

  constructor(deps: SendChatMessageDeps) {
    this.deps = deps;
  }

  async execute(
    friendshipId: string,
    senderId: string,
    content: string,
  ): Promise<ChatMessageOutput> {
    const friendship =
      await this.deps.friendshipRepository.findById(friendshipId);
    if (!friendship) {
      throw new FriendshipNotFoundError(friendshipId);
    }

    if (!friendship.isActive()) {
      throw new FriendshipNotActiveError(friendshipId);
    }

    if (!friendship.isMember(senderId)) {
      throw new UnauthorizedParticipantError(senderId);
    }

    const otherUserId =
      friendship.userA === senderId ? friendship.userB : friendship.userA;

    const blocked =
      await this.deps.blockRepository.isBlockedEitherDirection(
        senderId,
        otherUserId,
      );
    if (blocked) {
      throw new UserBlockedError();
    }

    if (!this.deps.rateLimiter.isAllowed(senderId)) {
      throw new RateLimitExceededError();
    }
    this.deps.rateLimiter.consume(senderId);

    const scrubResult = this.deps.piiScrubber.scrub(content);

    const now = new Date();
    const message = ChatMessage.create({
      id: crypto.randomUUID(),
      friendshipId,
      senderId,
      content: scrubResult.scrubbed,
      piiScrubbed: scrubResult.piiDetected,
      createdAt: now,
    });

    await this.deps.messageRepository.save(message);

    await this.deps.realtimeBroadcaster.broadcast(
      `chat:${friendshipId}`,
      "new_message",
      {
        id: message.id,
        friendshipId: message.friendshipId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      },
    );

    this.deps.eventTracker
      ?.track(RELATIONSHIP_EVENT_TYPES.REALTIME_MESSAGE_SENT, senderId, null, { friendshipId })
      .catch(() => {});

    return {
      id: message.id,
      friendshipId: message.friendshipId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    };
  }
}
