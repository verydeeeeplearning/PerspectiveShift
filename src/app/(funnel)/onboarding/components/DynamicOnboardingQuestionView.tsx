import { type RubricAnswerValue } from "./RubricQuestion";
import { ProgressBar } from "./ProgressBar";
import { OnboardingQuestionRenderer } from "./OnboardingQuestionRenderer";
import type { AnswerMap, QuestionData } from "./onboarding-flow.helpers";

interface DynamicOnboardingQuestionViewProps {
  label: string;
  totalQuestions: number;
  totalAnswered: number;
  targetTotal: number;
  currentIndex: number;
  seedCount: number;
  currentQuestion: QuestionData;
  answers: AnswerMap;
  onAnswer: (
    questionId: number | string,
    value: boolean | RubricAnswerValue | string,
  ) => void;
  onCoachClick: () => void;
  onExampleSwipe: () => void;
  onEditPrecision: () => void;
}

export function DynamicOnboardingQuestionView({
  label,
  totalQuestions,
  totalAnswered,
  targetTotal,
  currentIndex,
  seedCount,
  currentQuestion,
  answers,
  onAnswer,
  onCoachClick,
  onExampleSwipe,
  onEditPrecision,
}: DynamicOnboardingQuestionViewProps) {
  return (
    <div className="flex flex-col gap-8 py-4">
      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
        <p className="text-sm text-gray-600">
          정밀도: <span className="font-semibold">{label}</span> (
          {totalQuestions}문항)
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {totalAnswered}/{targetTotal}
          </span>
          <button
            type="button"
            onClick={onEditPrecision}
            className="text-sm text-blue-700 underline underline-offset-2"
          >
            [변경]
          </button>
        </div>
      </div>

      <ProgressBar
        current={Math.min(totalAnswered + 1, targetTotal)}
        total={targetTotal}
        phase={currentIndex < seedCount ? "core" : "extended"}
      />

      <div className="min-h-[240px]">
        <OnboardingQuestionRenderer
          question={currentQuestion}
          answers={answers}
          onAnswer={onAnswer}
          onCoachClick={onCoachClick}
          onExampleSwipe={onExampleSwipe}
        />
      </div>
    </div>
  );
}
