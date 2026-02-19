interface HighlightProps {
  turnId: string;
  startOffset: number;
  endOffset: number;
  highlightedText: string;
}

export class Highlight {
  readonly turnId: string;
  readonly startOffset: number;
  readonly endOffset: number;
  readonly highlightedText: string;

  private constructor(props: HighlightProps) {
    this.turnId = props.turnId;
    this.startOffset = props.startOffset;
    this.endOffset = props.endOffset;
    this.highlightedText = props.highlightedText;
  }

  static create(props: HighlightProps): Highlight {
    if (props.startOffset < 0) {
      throw new Error("startOffset must be non-negative");
    }
    if (props.startOffset >= props.endOffset) {
      throw new Error("startOffset must be less than endOffset");
    }
    if (!props.highlightedText.trim()) {
      throw new Error("highlightedText must not be empty");
    }
    return new Highlight(props);
  }

  toAutoQuote(): string {
    const trimmed = this.highlightedText.trim();
    return `"${trimmed}"라고 하셨는데, `;
  }
}
