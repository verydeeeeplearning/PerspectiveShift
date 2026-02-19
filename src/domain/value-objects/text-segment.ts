export class TextSegment {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly startIndex: number,
    public readonly endIndex: number,
    public readonly isHighlighted: boolean = false,
  ) {}

  toggle(): TextSegment {
    return new TextSegment(
      this.id,
      this.text,
      this.startIndex,
      this.endIndex,
      !this.isHighlighted,
    );
  }

  equals(other: TextSegment): boolean {
    return this.id === other.id;
  }
}
