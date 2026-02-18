import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { MessageRepository } from "@/domain/interfaces/message-repository";
import type { ChatHistoryOutput } from "../dtos/chat-output";
import {
  FriendshipNotFoundError,
  UnauthorizedParticipantError,
} from "@/domain/errors/domain-errors";

export interface GetChatHistoryDeps {
  friendshipRepository: FriendshipRepository;
  messageRepository: MessageRepository;
}

export class GetChatHistoryUseCase {
  private deps: GetChatHistoryDeps;

  constructor(deps: GetChatHistoryDeps) {
    this.deps = deps;
  }

  async execute(
    friendshipId: string,
    userId: string,
    limit: number = 50,
    before?: Date,
  ): Promise<ChatHistoryOutput> {
    const friendship =
      await this.deps.friendshipRepository.findById(friendshipId);
    if (!friendship) {
      throw new FriendshipNotFoundError(friendshipId);
    }

    if (!friendship.isMember(userId)) {
      throw new UnauthorizedParticipantError(userId);
    }

    const fetchLimit = limit + 1;
    const messages = await this.deps.messageRepository.findByFriendship(
      friendshipId,
      fetchLimit,
      before,
    );

    const hasMore = messages.length > limit;
    const resultMessages = hasMore ? messages.slice(0, limit) : messages;

    return {
      messages: resultMessages.map((m) => ({
        id: m.id,
        friendshipId: m.friendshipId,
        senderId: m.senderId,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
      hasMore,
    };
  }
}
