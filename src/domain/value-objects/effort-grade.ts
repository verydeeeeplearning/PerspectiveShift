import { DomainError } from "../errors/domain-errors";

export class InvalidEffortGradeError extends DomainError {
  constructor(value: string) {
    super(
      `Invalid effort grade: "${value}". Must be one of: QUICK, STRUCTURED, DEEP`,
    );
  }
}

export const EFFORT_GRADES = {
  QUICK: {
    label: "가볍게",
    description: "5분 안에 핵심 관점만 교환",
    durationMinutes: 5,
    stepCount: 3,
  },
  STRUCTURED: {
    label: "체계적으로",
    description: "15분 동안 구조화된 대화 진행",
    durationMinutes: 15,
    stepCount: 5,
  },
  DEEP: {
    label: "깊이 있게",
    description: "30분 이상 심층 대화와 성찰",
    durationMinutes: 30,
    stepCount: 7,
  },
} as const;

export type EffortGradeKey = keyof typeof EFFORT_GRADES;

export class EffortGrade {
  readonly key: EffortGradeKey;
  readonly label: string;
  readonly description: string;
  readonly durationMinutes: number;
  readonly stepCount: number;

  private constructor(key: EffortGradeKey) {
    const info = EFFORT_GRADES[key];
    this.key = key;
    this.label = info.label;
    this.description = info.description;
    this.durationMinutes = info.durationMinutes;
    this.stepCount = info.stepCount;
  }

  static create(key: EffortGradeKey): EffortGrade {
    if (!(key in EFFORT_GRADES)) {
      throw new InvalidEffortGradeError(key);
    }
    return new EffortGrade(key);
  }

  equals(other: EffortGrade): boolean {
    return this.key === other.key;
  }
}
