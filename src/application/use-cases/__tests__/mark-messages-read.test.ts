import { describe, it, expect, vi } from "vitest";
import { MarkMessagesReadUseCase } from "../mark-messages-read";
import { ChatMessage } from "@/domain/entities/chat-message";
import type { MessageRepository } from "@/domain/interfaces/message-repository";
import type { ReceiptRepository } from "@/domain/interfaces/receipt-repository";

function makeMessage(senderId: string = "user-a") {
  return ChatMessage.create({
    id: "msg-1",
    friendshipId: "friendship-1",
    senderId,
    content: "Hello!",
    piiScrubbed: false,
    createdAt: new Date(),
  });
}

describe("MarkMessagesReadUseCase", () => {
  function setup(message: ChatMessage | null = makeMessage()) {
    const messageRepo: MessageRepository = {
      save: vi.fn(),
      findByFriendship: vi.fn(),
      findById: vi.fn().mockResolvedValue(message),
    };
    const receiptRepo: ReceiptRepository = {
      markRead: vi.fn(),
    };
    const uc = new MarkMessagesReadUseCase({
      messageRepository: messageRepo,
      receiptRepository: receiptRepo,
    });
    return { uc, messageRepo, receiptRepo };
  }

  it("marks messages as read for a different sender", async () => {
    const { uc, receiptRepo } = setup(makeMessage("user-a"));
    const result = await uc.execute(["msg-1"], "user-b");

    expect(result.markedCount).toBe(1);
    expect(receiptRepo.markRead).toHaveBeenCalledWith("msg-1", "user-b");
  });

  it("does not mark own messages as read", async () => {
    const { uc, receiptRepo } = setup(makeMessage("user-a"));
    const result = await uc.execute(["msg-1"], "user-a");

    expect(result.markedCount).toBe(0);
    expect(receiptRepo.markRead).not.toHaveBeenCalled();
  });

  it("skips messages that do not exist", async () => {
    const { uc, receiptRepo } = setup(null);
    const result = await uc.execute(["nonexistent"], "user-b");

    expect(result.markedCount).toBe(0);
    expect(receiptRepo.markRead).not.toHaveBeenCalled();
  });
});
