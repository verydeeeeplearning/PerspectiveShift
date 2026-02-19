"use client";

import { useState } from "react";

interface FollowUpCheckinProps {
  checkinId: string;
  onSubmit: (checkinId: string, score: number) => void;
  onDismiss?: () => void;
}

const labels = ["", "전혀 안 줄었다", "조금", "보통", "많이", "완전히 줄었다"];

export function FollowUpCheckin({ checkinId, onSubmit, onDismiss }: FollowUpCheckinProps) {
  const [score, setScore] = useState<number>(0);

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-amber-900">1주 후 체크인</h4>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs text-gray-400 hover:text-gray-600"
            aria-label="닫기"
          >
            나중에
          </button>
        )}
      </div>

      <p className="mb-3 text-sm text-amber-800">
        다른 의견 대화에 대한 회피감이 줄었나요?
      </p>

      <div className="mb-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setScore(s)}
            className={`flex-1 rounded-lg border px-2 py-1 text-center text-xs transition-colors ${
              score === s
                ? "border-amber-500 bg-amber-100 text-amber-800"
                : "border-gray-200 bg-white text-gray-600"
            }`}
            aria-label={`회피감 감소 ${s}점`}
          >
            <div className="font-bold">{s}</div>
            <div className="text-[10px]">{labels[s]}</div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => score > 0 && onSubmit(checkinId, score)}
        disabled={score === 0}
        className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        제출
      </button>
    </div>
  );
}
