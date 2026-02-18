import type { MessageRepository } from "@/domain/interfaces/message-repository";
import type { ReceiptRepository } from "@/domain/interfaces/receipt-repository";

export interface MarkMessagesReadDeps {
  messageRepository: MessageRepository;
  receiptRepository: ReceiptRepository;
}

export class MarkMessagesReadUseCase {
  private deps: MarkMessagesReadDeps;

  constructor(deps: MarkMessagesReadDeps) {
    this.deps = deps;
  }

  async execute(
    messageIds: string[],
    readerId: string,
  ): Promise<{ markedCount: number }> {
    let markedCount = 0;

    for (const messageId of messageIds) {
      const message = await this.deps.messageRepository.findById(messageId);
      if (message && message.senderId !== readerId) {
        await this.deps.receiptRepository.markRead(messageId, readerId);
        markedCount++;
      }
    }

    return { markedCount };
  }
}
