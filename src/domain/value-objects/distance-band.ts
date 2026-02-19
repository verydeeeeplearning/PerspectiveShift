import { DomainError } from "../errors/domain-errors";

export class InvalidDistanceBandError extends DomainError {
  constructor(min: number, max: number) {
    super(
      `Invalid distance band: min (${min}) must be < max (${max}), both in [0, 2]`,
    );
  }
}

export type BandLevel = "LOW" | "MEDIUM" | "HIGH";

export class DistanceBand {
  readonly min: number;
  readonly max: number;

  private constructor(min: number, max: number) {
    this.min = Math.round(min * 1000) / 1000;
    this.max = Math.round(max * 1000) / 1000;
  }

  static create(min: number, max: number): DistanceBand {
    if (min < 0 || max > 2 || min >= max) {
      throw new InvalidDistanceBandError(min, max);
    }
    return new DistanceBand(min, max);
  }

  contains(distance: number): boolean {
    return distance >= this.min && distance <= this.max;
  }

  get label(): BandLevel {
    if (this.max <= 0.5) return "LOW";
    if (this.max <= 0.7) return "MEDIUM";
    return "HIGH";
  }

  equals(other: DistanceBand): boolean {
    return this.min === other.min && this.max === other.max;
  }
}

export const STANDARD_BANDS = {
  LOW: DistanceBand.create(0.2, 0.4),
  MEDIUM: DistanceBand.create(0.3, 0.6),
  HIGH: DistanceBand.create(0.4, 0.8),
} as const;
