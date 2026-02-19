import { InvalidDisclosureLevelError } from "../errors/domain-errors";

export const DISCLOSURE_LEVELS = [0, 1, 2, 3] as const;
export type DisclosureLevelValue = (typeof DISCLOSURE_LEVELS)[number];

export const DISCLOSURE_LEVEL_LABELS: Record<DisclosureLevelValue, string> = {
  0: "익명",
  1: "유형 공개",
  2: "스탠스 공개",
  3: "이름 공개",
};

export class DisclosureLevel {
  readonly value: DisclosureLevelValue;

  private constructor(value: DisclosureLevelValue) {
    this.value = value;
  }

  static create(value: number): DisclosureLevel {
    if (!DISCLOSURE_LEVELS.includes(value as DisclosureLevelValue)) {
      throw new InvalidDisclosureLevelError(-1, value);
    }
    return new DisclosureLevel(value as DisclosureLevelValue);
  }

  get label(): string {
    return DISCLOSURE_LEVEL_LABELS[this.value];
  }

  canEscalateTo(target: DisclosureLevel): boolean {
    return target.value > this.value;
  }

  isHigherThan(other: DisclosureLevel): boolean {
    return this.value > other.value;
  }

  equals(other: DisclosureLevel): boolean {
    return this.value === other.value;
  }
}
