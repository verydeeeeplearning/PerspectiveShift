import { DomainError } from "../errors/domain-errors";

export const REFLECTION_TYPES = [
  "SUMMARY",         // R1: 강제 요약
  "ACCURACY_CHECK",  // R2: 정확성 확인
  "STEELMAN",        // R3: consider-the-opposite
  "COMMON_GROUND",   // R4: 공통점
  "FUTURE_QUESTION", // R5: 미래 질문
] as const;

export type ReflectionType = (typeof REFLECTION_TYPES)[number];

const REQUIRED_TYPES: Set<ReflectionType> = new Set([
  "SUMMARY",
  "ACCURACY_CHECK",
]);

export class InvalidReflectionTypeError extends DomainError {
  constructor(value: string) {
    super(`Invalid reflection type: "${value}"`);
  }
}

export class RequiredReflectionContentError extends DomainError {
  constructor(type: ReflectionType) {
    super(`Reflection type "${type}" requires non-empty content`);
  }
}

export class ReflectionItem {
  readonly type: ReflectionType;
  readonly content: string;
  readonly isRequired: boolean;

  private constructor(type: ReflectionType, content: string) {
    this.type = type;
    this.content = content;
    this.isRequired = REQUIRED_TYPES.has(type);
  }

  static create(type: ReflectionType, content: string): ReflectionItem {
    if (!REFLECTION_TYPES.includes(type)) {
      throw new InvalidReflectionTypeError(type);
    }
    const trimmed = content.trim();
    if (REQUIRED_TYPES.has(type) && trimmed.length === 0) {
      throw new RequiredReflectionContentError(type);
    }
    return new ReflectionItem(type, trimmed);
  }
}
