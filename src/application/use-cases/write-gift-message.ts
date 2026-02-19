import { GiftMessage } from "@/domain/value-objects/gift-message";

interface WriteGiftMessageInput {
  text: string;
  writtenAtStep: string;
}

interface WriteGiftMessageResult {
  text: string;
  writtenAtStep: string;
  revealedAtPeakEnd: boolean;
}

export class WriteGiftMessageUseCase {
  execute(input: WriteGiftMessageInput): WriteGiftMessageResult {
    const msg = GiftMessage.create({
      text: input.text,
      writtenAtStep: input.writtenAtStep,
    });
    return {
      text: msg.text,
      writtenAtStep: msg.writtenAtStep,
      revealedAtPeakEnd: msg.revealedAtPeakEnd,
    };
  }
}
