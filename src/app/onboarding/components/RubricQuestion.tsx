"use client";

const LABELS = [
  "매우 반대",
  "반대",
  "보통",
  "동의",
  "매우 동의",
] as const;

interface RubricQuestionProps {
  questionId: number;
  text: string;
  onAnswer: (questionId: number, value: number) => void;
  selected?: number | null;
}

export function RubricQuestion({
  questionId,
  text,
  onAnswer,
  selected,
}: RubricQuestionProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-center text-lg font-medium leading-relaxed">
        {text}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        {LABELS.map((label, index) => {
          const score = index + 1;
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
    </div>
  );
}
