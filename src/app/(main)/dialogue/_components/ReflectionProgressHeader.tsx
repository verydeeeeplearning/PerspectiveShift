"use client";

interface ReflectionProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
}

export function ReflectionProgressHeader({
  currentStep,
  totalSteps,
}: ReflectionProgressHeaderProps) {
  const display = currentStep + 1;
  const pct = (display / totalSteps) * 100;

  return (
    <div className="mb-4 rounded-xl bg-blue-50 p-4">
      <p className="mb-2 text-center text-sm font-bold text-blue-800">
        거의 다 왔어요! 마지막 2분
      </p>
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-blue-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-medium text-blue-700">
          {display}/{totalSteps}
        </span>
      </div>
    </div>
  );
}
