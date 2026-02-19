const MAX_LENGTH = 100;

interface GiftMessageProps {
  text: string;
  writtenAtStep: string;
  revealedAtPeakEnd?: boolean;
}

export class GiftMessage {
  readonly text: string;
  readonly writtenAtStep: string;
  readonly revealedAtPeakEnd: boolean;

  private constructor(props: { text: string; writtenAtStep: string; revealedAtPeakEnd: boolean }) {
    this.text = props.text;
    this.writtenAtStep = props.writtenAtStep;
    this.revealedAtPeakEnd = props.revealedAtPeakEnd;
  }

  static create(props: GiftMessageProps): GiftMessage {
    const trimmed = props.text.trim();
    if (!trimmed) throw new Error("Gift message text must not be empty");
    if (trimmed.length > MAX_LENGTH) throw new Error(`Gift message must be ${MAX_LENGTH} chars or less`);
    return new GiftMessage({ text: trimmed, writtenAtStep: props.writtenAtStep, revealedAtPeakEnd: props.revealedAtPeakEnd ?? false });
  }

  reveal(): GiftMessage {
    return new GiftMessage({ text: this.text, writtenAtStep: this.writtenAtStep, revealedAtPeakEnd: true });
  }
}
