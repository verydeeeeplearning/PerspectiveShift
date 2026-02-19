import { describe, it, expect, vi } from "vitest";
import { GetChatHistoryUseCase } from "../get-chat-history";
import { Friendship } from "@/domain/entities/friendship";
import { ChatMessage } from "@/domain/entities/chat-message";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { MessageRepository } from "@/domain/interfaces/message-repository";
import {
  FriendshipNotFoundError,
  UnauthorizedParticipantError,
} from "@/domain/errors/domain-errors";

function makeFriendship() {
  return Friendship.create({
    id: "friendship-1",
    userA: "user-a",
    userB: "user-b",
    status: "ACTIVE",
    dialogueCount: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeMessages(count: number): ChatMessage[] {
  return Array.from({ length: count }, (_, i) =>
    ChatMessage.create({
      id: `msg-${i}`,
      friendshipId: "friendship-1",
      senderId: i % 2 === 0 ? "user-a" : "user-b",
      content: `Message ${i}`,
      piiScrubbed: false,
      createdAt: new Date(Date.now() - i * 1000),
    }),
  );
}

describe("GetChatHistoryUseCase", () => {
  function setup(
    friendship: Friendship | null = makeFriendship(),
    messages: ChatMessage[] = makeMessages(3),
  ) {
    const friendshipRepo: FriendshipRepository = {
      findById: vi.fn().mockResolvedValue(friendship),
      findByUsers: vi.fn(),
      findByUser: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };
    const messageRepo: MessageRepository = {
      save: vi.fn(),
      findByFriendship: vi.fn().mockResolvedValue(messages),
      findById: vi.fn(),
    };
    const uc = new GetChatHistoryUseCase({
      friendshipRepository: friendshipRepo,
      messageRepository: messageRepo,
    });
    return { uc, friendshipRepo, messageRepo };
  }

  it("returns messages for a valid member", async () => {
    const { uc } = setup();
    const result = await uc.execute("friendship-1", "user-a");

    expect(result.messages).toHaveLength(3);
    expect(result.hasMore).toBe(false);
    expect(result.messages[0].id).toBe("msg-0");
  });

  it("throws FriendshipNotFoundError when friendship does not exist", async () => {
    const { uc } = setup(null);
    await expect(
      uc.execute("friendship-1", "user-a"),
    ).rejects.toThrow(FriendshipNotFoundError);
  });

  it("throws UnauthorizedParticipantError when user is not a member", async () => {
    const { uc } = setup();
    await expect(
      uc.execute("friendship-1", "stranger"),
    ).rejects.toThrow(UnauthorizedParticipantError);
  });

  it("returns hasMore=true when more messages exist", async () => {
    const messages = makeMessages(51);
    const { uc } = setup(makeFriendship(), messages);
    const result = await uc.execute("friendship-1", "user-a", 50);

    expect(result.messages).toHaveLength(50);
    expect(result.hasMore).toBe(true);
  });

  it("passes before parameter to repository for pagination", async () => {
    const { uc, messageRepo } = setup();
    const before = new Date("2026-02-18T00:00:00Z");
    await uc.execute("friendship-1", "user-a", 50, before);

    expect(messageRepo.findByFriendship).toHaveBeenCalledWith(
      "friendship-1",
      51,
      before,
    );
  });
});
