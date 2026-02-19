interface CommonGroundDiscoveryProps {
  mostConvincingPoint?: string | null;
  nextQuestion?: string | null;
}

export class CommonGroundDiscovery {
  readonly mostConvincingPoint: string | null;
  readonly nextQuestion: string | null;

  private constructor(props: { mostConvincingPoint: string | null; nextQuestion: string | null }) {
    this.mostConvincingPoint = props.mostConvincingPoint;
    this.nextQuestion = props.nextQuestion;
  }

  static create(props: CommonGroundDiscoveryProps): CommonGroundDiscovery {
    return new CommonGroundDiscovery({
      mostConvincingPoint: props.mostConvincingPoint?.trim() || null,
      nextQuestion: props.nextQuestion?.trim() || null,
    });
  }

  get isEmpty(): boolean {
    return this.mostConvincingPoint === null && this.nextQuestion === null;
  }
}
