"use client";

const LABELS = [
  "매우 반대",
  "반대",
  "보통",
  "동의",
  "매우 동의",
] as const;

const UNCERTAIN_OPTIONS = [
  { key: "DONT_KNOW", label: "모르겠어요" },
  { key: "DEPENDS", label: "상황따라" },
] as const;

export type RubricAnswerValue =
  | 1
  | 2
  | 3
  | 4
  | 5
  | (typeof UNCERTAIN_OPTIONS)[number]["key"];

interface RubricQuestionProps {
  questionId: number | string;
  text: string;
  onAnswer: (questionId: number | string, value: RubricAnswerValue) => void;
  selected?: RubricAnswerValue | null;
  allowUncertain?: boolean;
  tooltipText?: string;
}

export function RubricQuestion({
  questionId,
  text,
  onAnswer,
  selected,
  allowUncertain = false,
  tooltipText,
}: RubricQuestionProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="space-y-2 text-center">
        <p className="text-lg font-medium leading-relaxed">{text}</p>
        {tooltipText && (
          <p className="text-xs text-gray-500" role="note">
            ℹ️ {tooltipText}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        {LABELS.map((label, index) => {
          const score = (index + 1) as 1 | 2 | 3 | 4 | 5;
          const isSelected = selected === score;
          return (
            <button
              key={score}
              type="button"
              onClick={() => onAnswer(questionId, score)}
              className={`rounded-lg px-4 py-3 text-sm transition-all ${
                isSelected
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-blue-50"
              }`}
              aria-pressed={isSelected}
            >
              <span className="block text-xs text-opacity-70">
                {score}
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      {allowUncertain && (
        <div className="flex flex-wrap justify-center gap-2">
          {UNCERTAIN_OPTIONS.map((option) => {
            const isSelected = selected === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onAnswer(questionId, option.key)}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  isSelected
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
