import { DomainError } from "../errors/domain-errors";

const MAX_LENGTH = 500;

export class PersonalContextTooLongError extends DomainError {
  constructor(length: number) {
    super(
      `Personal context must be at most ${MAX_LENGTH} characters, got ${length}`,
    );
  }
}

export class PersonalContext {
  readonly scrubbedText: string;

  private constructor(scrubbedText: string) {
    this.scrubbedText = scrubbedText;
  }

  static create(scrubbedText: string): PersonalContext {
    const trimmed = scrubbedText.trim();
    if (trimmed.length > MAX_LENGTH) {
      throw new PersonalContextTooLongError(trimmed.length);
    }
    return new PersonalContext(trimmed);
  }

  isEmpty(): boolean {
    return this.scrubbedText.length === 0;
  }
}
