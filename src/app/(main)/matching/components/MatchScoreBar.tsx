"use client";

interface MatchScoreBarProps {
  score: number;
}

export function MatchScoreBar({ score }: MatchScoreBarProps) {
  const percentage = Math.round(score * 100);

  return (
    <div>
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>매칭 점수</span>
        <span>{percentage}%</span>
      </div>
      <div
        className="w-full bg-gray-200 rounded-full h-2"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="매칭 점수"
      >
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
