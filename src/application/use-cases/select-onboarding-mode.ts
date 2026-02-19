import { QuestionBank } from "@/domain/entities/question-bank";
import {
  ONBOARDING_MODES,
  type OnboardingModeKey,
} from "@/domain/value-objects/onboarding-mode";
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
  }>;
  estimatedMinutes: number;
  precision: {
    value: number;
    displayText: string;
    label: string;
  };
}

export class SelectOnboardingModeUseCase {
  constructor(private readonly deps: SelectOnboardingModeDeps) {}

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
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        axis: q.axis,
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
