import { DomainError } from "../errors/domain-errors";

export interface DifferenceDistanceRange {
  min: number;
  max: number;
}

export class DifferenceLevel {
  readonly value: number;

  private constructor(value: number) {
    this.value = Math.round(value * 1000) / 1000;
  }

  static create(value: number): DifferenceLevel {
    if (value < 0 || value > 1) {
      throw new DomainError(
        `Difference level must be between 0 and 1, got ${value}`,
      );
    }
    return new DifferenceLevel(value);
  }

  toDistanceRange(maxDistanceCap = 1): DifferenceDistanceRange {
    const baseMin =
      Math.round((0.4 * this.value * this.value + 0.4 * this.value) * 1000) /
      1000;
    const baseMax = Math.round((baseMin + 0.2) * 1000) / 1000;
    const max = Math.min(baseMax, maxDistanceCap);
    const min = Math.min(baseMin, max);
    return { min, max };
  }

  toLabel(): string {
    if (this.value < 0.34) return "비슷한 상대";
    if (this.value < 0.67) return "균형 탐색";
    return "다른 상대";
  }
}
