import { InvalidOnboardingModeError } from "../errors/domain-errors";

export const ONBOARDING_MODES = {
  QUICK: {
    label: "빠르게 시작",
    description: "5문항으로 핵심 입장만 빠르게 파악",
    questionCount: 5,
    estimatedMinutes: 2,
    isRecommended: true,
  },
  STANDARD: {
    label: "표준 분석",
    description: "10문항으로 더 정확한 입장 분석",
    questionCount: 10,
    estimatedMinutes: 4,
    isRecommended: false,
  },
  PRECISE: {
    label: "정밀 분석",
    description: "20문항으로 가장 정밀한 분석과 매칭 품질 향상",
    questionCount: 20,
    estimatedMinutes: 9,
    isRecommended: false,
  },
} as const;

export type OnboardingModeKey = keyof typeof ONBOARDING_MODES;

const CORE_QUESTION_COUNT = 5;

export class OnboardingMode {
  readonly key: OnboardingModeKey;
  readonly label: string;
  readonly description: string;
  readonly questionCount: number;
  readonly estimatedMinutes: number;
  readonly isRecommended: boolean;

  private constructor(key: OnboardingModeKey) {
    const info = ONBOARDING_MODES[key];
    this.key = key;
    this.label = info.label;
    this.description = info.description;
    this.questionCount = info.questionCount;
    this.estimatedMinutes = info.estimatedMinutes;
    this.isRecommended = info.isRecommended;
  }

  static create(key: OnboardingModeKey): OnboardingMode {
    if (!(key in ONBOARDING_MODES)) {
      throw new InvalidOnboardingModeError(key);
    }
    return new OnboardingMode(key);
  }

  get coreQuestionCount(): number {
    return CORE_QUESTION_COUNT;
  }

  get extendedQuestionCount(): number {
    return this.questionCount - CORE_QUESTION_COUNT;
  }

  equals(other: OnboardingMode): boolean {
    return this.key === other.key;
  }
}
