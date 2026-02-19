import { InvalidConfidenceLevelError } from "../errors/domain-errors";

export const CONFIDENCE_LEVELS = {
  LOW: "약",
  MEDIUM: "중",
  HIGH: "강",
} as const;

export type ConfidenceLevelKey = keyof typeof CONFIDENCE_LEVELS;

const NUMERIC_VALUES: Record<ConfidenceLevelKey, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

export class ConfidenceLevel {
  readonly value: ConfidenceLevelKey;
  readonly label: string;
  readonly numericValue: number;

  private constructor(value: ConfidenceLevelKey) {
    this.value = value;
    this.label = CONFIDENCE_LEVELS[value];
    this.numericValue = NUMERIC_VALUES[value];
  }

  static create(value: string): ConfidenceLevel {
    if (!isValidConfidenceLevel(value)) {
      throw new InvalidConfidenceLevelError(value);
    }
    return new ConfidenceLevel(value);
  }

  equals(other: ConfidenceLevel): boolean {
    return this.value === other.value;
  }
}

function isValidConfidenceLevel(value: string): value is ConfidenceLevelKey {
  return value in CONFIDENCE_LEVELS;
}
