import { GiftMessage } from "@/domain/value-objects/gift-message";

interface RevealGiftMessageInput {
  text: string;
  writtenAtStep: string;
}

interface RevealGiftMessageResult {
  text: string;
  writtenAtStep: string;
  revealedAtPeakEnd: boolean;
}

export class RevealGiftMessageUseCase {
  execute(input: RevealGiftMessageInput): RevealGiftMessageResult {
    const msg = GiftMessage.create({
      text: input.text,
      writtenAtStep: input.writtenAtStep,
      revealedAtPeakEnd: false,
    });
    const revealed = msg.reveal();
    return {
      text: revealed.text,
      writtenAtStep: revealed.writtenAtStep,
      revealedAtPeakEnd: revealed.revealedAtPeakEnd,
    };
  }
}
