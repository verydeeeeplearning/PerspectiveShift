"use client";

interface OxQuestionProps {
  questionId: number | string;
  text: string;
  onAnswer: (questionId: number | string, value: boolean) => void;
  selected?: boolean | null;
}

export function OxQuestion({
  questionId,
  text,
  onAnswer,
  selected,
}: OxQuestionProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-center text-lg font-medium leading-relaxed">
        {text}
      </p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => onAnswer(questionId, true)}
          className={`rounded-xl px-8 py-4 text-lg font-bold transition-all ${
            selected === true
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-blue-50"
          }`}
          aria-pressed={selected === true}
        >
          O
        </button>
        <button
          type="button"
          onClick={() => onAnswer(questionId, false)}
          className={`rounded-xl px-8 py-4 text-lg font-bold transition-all ${
            selected === false
              ? "bg-red-500 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-red-50"
          }`}
          aria-pressed={selected === false}
        >
          X
        </button>
      </div>
    </div>
  );
}
