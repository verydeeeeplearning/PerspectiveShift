"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  phase: "core" | "extended";
}

export function ProgressBar({ current, total, phase }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
      <div className="mb-2 flex justify-between text-sm text-gray-500">
        <span>
          {phase === "core" ? "핵심 질문" : "확장 질문"} {current}/{total}
        </span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
