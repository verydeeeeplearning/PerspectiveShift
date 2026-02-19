"use client";

const STEPS = [
  { key: "POSITION", label: "입장", emoji: "1" },
  { key: "QUESTION", label: "질문", emoji: "2" },
  { key: "ANSWER", label: "답변", emoji: "3" },
  { key: "REFLECTION", label: "성찰", emoji: "4" },
];

interface StepIndicatorProps {
  currentStep: string;
  compact?: boolean;
}

export function StepIndicator({
  currentStep,
  compact = false,
}: StepIndicatorProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div
      className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}
      role="progressbar"
      aria-valuenow={currentIdx + 1}
      aria-valuemin={1}
      aria-valuemax={4}
      aria-label="대화 단계"
    >
      {STEPS.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={step.key} className="flex items-center gap-1">
            <div
              className={`
                flex items-center justify-center rounded-full
                ${compact ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm"}
                ${isDone ? "bg-blue-600 text-white" : ""}
                ${isCurrent ? "bg-blue-100 text-blue-800 ring-2 ring-blue-400" : ""}
                ${!isDone && !isCurrent ? "bg-gray-100 text-gray-400" : ""}
              `}
            >
              {step.emoji}
            </div>
            {!compact && (
              <span
                className={`text-sm ${
                  isCurrent ? "font-medium text-blue-800" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            )}
            {idx < STEPS.length - 1 && (
              <div
                className={`${compact ? "w-4" : "w-8"} h-0.5 ${
                  idx < currentIdx ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
