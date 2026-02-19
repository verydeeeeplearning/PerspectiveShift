import { InvalidCoreValueError } from "../errors/domain-errors";

export const CORE_VALUES = {
  FAIRNESS: "공정",
  FREEDOM: "자유",
  CARING: "배려",
  ACHIEVEMENT: "성취",
  SAFETY: "안전",
  TRUTH: "진실",
  RESPONSIBILITY: "책임",
  GROWTH: "성장",
} as const;

export type CoreValueKey = keyof typeof CORE_VALUES;

export class CoreValue {
  readonly value: CoreValueKey;
  readonly label: string;

  private constructor(value: CoreValueKey) {
    this.value = value;
    this.label = CORE_VALUES[value];
  }

  static create(value: string): CoreValue {
    if (!isValidCoreValue(value)) {
      throw new InvalidCoreValueError(value);
    }
    return new CoreValue(value);
  }

  static allValues(): CoreValue[] {
    return (Object.keys(CORE_VALUES) as CoreValueKey[]).map(
      (key) => new CoreValue(key),
    );
  }

  equals(other: CoreValue): boolean {
    return this.value === other.value;
  }
}

function isValidCoreValue(value: string): value is CoreValueKey {
  return value in CORE_VALUES;
}
