import type { OpinionDistance } from "./opinion-distance";
import type { ReadinessScore } from "./readiness-score";

const DISTANCE_WEIGHT = 0.6;
const READINESS_WEIGHT = 0.4;

export class MatchScore {
  readonly value: number;
  readonly distanceFit: number;
  readonly readinessComponent: number;

  private constructor(
    distanceFit: number,
    readinessComponent: number,
  ) {
    this.distanceFit = Math.round(distanceFit * 1000) / 1000;
    this.readinessComponent =
      Math.round(readinessComponent * 1000) / 1000;
    this.value =
      Math.round(
        (distanceFit * DISTANCE_WEIGHT +
          readinessComponent * READINESS_WEIGHT) *
          1000,
      ) / 1000;
  }

  static calculate(
    distance: OpinionDistance,
    readiness: ReadinessScore,
  ): MatchScore {
    const distanceFit = distance.isInSweetSpot()
      ? Math.max(0, 1 - Math.abs(distance.value - 0.55) / 0.15)
      : 0;
    return new MatchScore(distanceFit, readiness.value);
  }

  equals(other: MatchScore): boolean {
    return this.value === other.value;
  }
}
