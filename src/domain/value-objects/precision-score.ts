import { InvalidPrecisionInputError } from "../errors/domain-errors";

const MAX_QUESTION_COUNT = 20;
const SECONDS_PER_QUESTION = 30;

// Target precision values aligned with product spec (v3.0 Section 4.4)
// 5q → ~62%, 10q → ~75%, 20q → ~95%
const PRECISION_TARGETS: ReadonlyArray<{ questions: number; precision: number }> = [
  { questions: 0, precision: 0 },
  { questions: 5, precision: 62 },
  { questions: 10, precision: 75 },
  { questions: 20, precision: 95 },
];

const MILESTONES = [
  { targetQuestions: 10, label: "75%" },
  { targetQuestions: 20, label: "90%" },
] as const;

export interface PrecisionMilestone {
  targetQuestions: number;
  targetPrecision: number;
  additionalQuestions: number;
  estimatedMinutes: number;
}

export class PrecisionScore {
  readonly value: number;
  private readonly _answeredCount: number;

  private constructor(value: number, answeredCount: number) {
    this.value = Math.round(Math.max(0, Math.min(100, value)));
    this._answeredCount = answeredCount;
  }

  static calculate(answeredCount: number, consistencyScore: number): PrecisionScore {
    if (answeredCount < 0) {
      throw new InvalidPrecisionInputError("Answer count must be non-negative");
    }

    const clampedConsistency = Math.max(0, Math.min(1, consistencyScore));
    const clampedCount = Math.min(answeredCount, MAX_QUESTION_COUNT);

    // Precision formula: linear interpolation between target milestones,
    // scaled by consistency (70%-100% range).
    // Targets: 0q→0%, 5q→62%, 10q→75%, 20q→95%
    const basePrecision = interpolatePrecision(clampedCount);
    const consistencyMultiplier = 0.7 + 0.3 * clampedConsistency;
    const rawValue = basePrecision * consistencyMultiplier;

    return new PrecisionScore(rawValue, answeredCount);
  }

  get label(): string {
    if (this.value >= 85) return "매우 정밀";
    if (this.value >= 70) return "정밀";
    if (this.value >= 50) return "보통";
    if (this.value >= 30) return "기본";
    return "초기";
  }

  get displayText(): string {
    return `${this.value}%`;
  }

  get answeredCount(): number {
    return this._answeredCount;
  }

  nextMilestone(): PrecisionMilestone | null {
    for (const milestone of MILESTONES) {
      if (this._answeredCount < milestone.targetQuestions) {
        const additional = milestone.targetQuestions - this._answeredCount;
        const targetScore = PrecisionScore.calculate(
          milestone.targetQuestions,
          1.0,
        );
        return {
          targetQuestions: milestone.targetQuestions,
          targetPrecision: targetScore.value,
          additionalQuestions: additional,
          estimatedMinutes: Math.ceil((additional * SECONDS_PER_QUESTION) / 60),
        };
      }
    }
    return null;
  }
}

function interpolatePrecision(questionCount: number): number {
  for (let i = 1; i < PRECISION_TARGETS.length; i++) {
    const prev = PRECISION_TARGETS[i - 1];
    const curr = PRECISION_TARGETS[i];
    if (questionCount <= curr.questions) {
      const ratio =
        (questionCount - prev.questions) / (curr.questions - prev.questions);
      return prev.precision + ratio * (curr.precision - prev.precision);
    }
  }
  return PRECISION_TARGETS[PRECISION_TARGETS.length - 1].precision;
}
