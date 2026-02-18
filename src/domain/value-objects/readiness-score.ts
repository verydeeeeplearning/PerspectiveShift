import { InvalidReadinessScoreError } from "../errors/domain-errors";

export class ReadinessScore {
  readonly value: number;

  private constructor(value: number) {
    this.value = Math.round(value * 1000) / 1000;
  }

  static create(value: number): ReadinessScore {
    if (value < 0 || value > 1) {
      throw new InvalidReadinessScoreError(value);
    }
    return new ReadinessScore(value);
  }

  equals(other: ReadinessScore): boolean {
    return this.value === other.value;
  }
}
