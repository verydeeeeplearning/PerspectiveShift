import { DomainError } from "../errors/domain-errors";

const MAX_LENGTH = 80;
const BANNED_LABELS = ["진보", "보수", "좌파", "우파", "좌익", "우익"];

export class ConversationTrailer {
  readonly text: string;

  private constructor(text: string) {
    this.text = text;
  }

  static create(text: string): ConversationTrailer {
    if (!text || text.trim().length === 0) {
      throw new DomainError("Conversation trailer text cannot be empty");
    }

    if (text.length > MAX_LENGTH) {
      throw new DomainError(
        `Conversation trailer must be ${MAX_LENGTH} chars or less, got ${text.length}`,
      );
    }

    for (const label of BANNED_LABELS) {
      if (text.includes(label)) {
        throw new DomainError(
          `가치 라벨 "${label}"은(는) Conversation Trailer에 포함할 수 없습니다`,
        );
      }
    }

    return new ConversationTrailer(text.trim());
  }
}
