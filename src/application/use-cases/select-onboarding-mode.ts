import { QuestionBank } from "@/domain/entities/question-bank";
import {
  ONBOARDING_MODES,
  type OnboardingModeKey,
} from "@/domain/value-objects/onboarding-mode";
import type { QuestionPrecision } from "@/domain/value-objects/question-precision";
import { PrecisionScore } from "@/domain/value-objects/precision-score";
import { InvalidOnboardingModeError } from "@/domain/errors/domain-errors";

export interface SelectOnboardingModeDeps {
  questionBank: QuestionBank;
}

export interface SelectedModeResult {
  mode: OnboardingModeKey;
  questions: ReadonlyArray<{
    id: string;
    text: string;
    type: string;
    axis: string;
    allowUncertain: boolean;
    tooltipText?: string;
  }>;
  estimatedMinutes: number;
  precisionLevel: QuestionPrecision;
  precision: {
    value: number;
    displayText: string;
    label: string;
  };
}

const PRECISION_TO_MODE: Record<QuestionPrecision, OnboardingModeKey> = {
  lite: "LITE",
  standard: "STANDARD",
  deep: "DEEP",
  comprehensive: "COMPREHENSIVE",
};

const MODE_TO_PRECISION: Record<OnboardingModeKey, QuestionPrecision> = {
  LITE: "lite",
  STANDARD: "standard",
  DEEP: "deep",
  COMPREHENSIVE: "comprehensive",
};

export class SelectOnboardingModeUseCase {
  constructor(private readonly deps: SelectOnboardingModeDeps) {}

  async executeByPrecision(
    precision: QuestionPrecision,
  ): Promise<SelectedModeResult> {
    return this.execute(PRECISION_TO_MODE[precision]);
  }

  async execute(mode: OnboardingModeKey): Promise<SelectedModeResult> {
    const modeInfo = ONBOARDING_MODES[mode];
    if (!modeInfo) {
      throw new InvalidOnboardingModeError(mode);
    }

    const questions = this.deps.questionBank.sampleForMode(mode);

    const precision = PrecisionScore.calculate(
      modeInfo.questionCount,
      1.0,
    );

    return {
      mode,
      precisionLevel: MODE_TO_PRECISION[mode],
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        axis: q.axis,
        allowUncertain: q.allowUncertain,
        tooltipText: q.tooltipText,
      })),
      estimatedMinutes: modeInfo.estimatedMinutes,
      precision: {
        value: precision.value,
        displayText: precision.displayText,
        label: precision.label,
      },
    };
  }
}
