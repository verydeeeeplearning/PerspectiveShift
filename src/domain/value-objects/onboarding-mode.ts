import { InvalidOnboardingModeError } from "../errors/domain-errors";

export const ONBOARDING_MODES = {
  LITE: {
    label: "라이트",
    description: "10문항으로 핵심 입장 파악",
    questionCount: 10,
    estimatedMinutes: 3,
    isRecommended: false,
  },
  STANDARD: {
    label: "표준 분석",
    description: "20문항으로 균형 잡힌 분석",
    questionCount: 20,
    estimatedMinutes: 7,
    isRecommended: true,
  },
  DEEP: {
    label: "심층 분석",
    description: "30문항으로 깊이 있는 입장 탐색",
    questionCount: 30,
    estimatedMinutes: 12,
    isRecommended: false,
  },
  COMPREHENSIVE: {
    label: "종합 분석",
    description: "50문항으로 가장 정밀한 분석과 매칭 품질 향상",
    questionCount: 50,
    estimatedMinutes: 20,
    isRecommended: false,
  },
} as const;

export type OnboardingModeKey = keyof typeof ONBOARDING_MODES;

const SEED_QUESTION_COUNT = 10;

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

  get seedQuestionCount(): number {
    return SEED_QUESTION_COUNT;
  }

  get dynamicQuestionCount(): number {
    return this.questionCount - SEED_QUESTION_COUNT;
  }

  equals(other: OnboardingMode): boolean {
    return this.key === other.key;
  }
}
