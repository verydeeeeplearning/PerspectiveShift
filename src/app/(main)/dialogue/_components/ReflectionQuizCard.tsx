"use client";

interface ReflectionQuizCardProps {
  options: string[];
  onAnswer: (index: number) => void;
}

export function ReflectionQuizCard({ options, onAnswer }: ReflectionQuizCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="mb-4 text-base font-semibold text-gray-900">
        상대방이 가장 중요하게 생각한 건?
      </p>
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onAnswer(i)}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
