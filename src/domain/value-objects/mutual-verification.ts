interface MutualVerificationProps {
  summarizedByOpponent: string;
  accuracySlider: number;
  correctionText?: string | null;
}

export class MutualVerification {
  readonly summarizedByOpponent: string;
  readonly accuracySlider: number;
  readonly correctionText: string | null;

  private constructor(props: {
    summarizedByOpponent: string;
    accuracySlider: number;
    correctionText: string | null;
  }) {
    this.summarizedByOpponent = props.summarizedByOpponent;
    this.accuracySlider = props.accuracySlider;
    this.correctionText = props.correctionText;
  }

  static create(props: MutualVerificationProps): MutualVerification {
    if (!props.summarizedByOpponent.trim()) {
      throw new Error("summarizedByOpponent must not be empty");
    }
    return new MutualVerification({
      summarizedByOpponent: props.summarizedByOpponent,
      accuracySlider: Math.max(0, Math.min(100, props.accuracySlider)),
      correctionText: props.correctionText?.trim() || null,
    });
  }

  get emoji(): string {
    if (this.accuracySlider >= 80) return "\u{1F60A}"; // 😊
    if (this.accuracySlider >= 50) return "\u{1F610}"; // 😐
    return "\u{1F615}"; // 😕
  }

  get hasCorrection(): boolean {
    return this.correctionText !== null;
  }
}
