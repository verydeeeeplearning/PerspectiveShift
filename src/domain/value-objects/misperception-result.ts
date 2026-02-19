import type { StanceDimension } from "./stance-dimension";

const ACCURACY_THRESHOLD = 0.15;

export class MisperceptionResult {
  readonly dimension: StanceDimension;
  readonly userPrediction: number;
  readonly actualBaseline: number;
  readonly gap: number;
  readonly gapPercentage: number;
  readonly isAccurate: boolean;

  private constructor(props: {
    dimension: StanceDimension;
    userPrediction: number;
    actualBaseline: number;
  }) {
    this.dimension = props.dimension;
    this.userPrediction = props.userPrediction;
    this.actualBaseline = props.actualBaseline;
    this.gap = Math.abs(props.userPrediction - props.actualBaseline);
    this.gapPercentage = Math.round(this.gap * 50);
    this.isAccurate = this.gap < ACCURACY_THRESHOLD;
  }

  static create(
    dimension: StanceDimension,
    userPrediction: number,
    actualBaseline: number,
  ): MisperceptionResult {
    return new MisperceptionResult({
      dimension,
      userPrediction: Math.max(-1, Math.min(1, userPrediction)),
      actualBaseline: Math.max(-1, Math.min(1, actualBaseline)),
    });
  }
}
