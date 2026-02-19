"use client";

import { useState, useEffect, useCallback } from "react";

interface FollowUpReviewCardProps {
  sessionId: string;
  topicTitle?: string;
  opponentKeyPoint?: string;
  onSubmit: (choice: string) => void;
}

const TIMEOUT_SECONDS = 30;

const choices = [
  { label: "바뀌었어요", value: "changed", emoji: "🔄" },
  { label: "모르겠어요", value: "unsure", emoji: "🤔" },
  { label: "같은 생각", value: "same", emoji: "💬" },
] as const;

const ACTION_GUIDE: Record<string, { emoji: string; text: string }> = {
  changed: { emoji: "✏️", text: "생각 지도에서 바뀐 부분을 업데이트해보세요" },
  unsure: { emoji: "🌱", text: "비슷한 주제로 가벼운 Level 0 대화를 추천해드릴게요" },
  same: { emoji: "🧭", text: "다른 주제로 새로운 관점을 탐색해보세요" },
};

export function FollowUpReviewCard({
  sessionId: _sessionId,
  topicTitle,
  opponentKeyPoint,
  onSubmit,
}: FollowUpReviewCardProps) {
  const [remaining, setRemaining] = useState(TIMEOUT_SECONDS);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (choice: string) => {
      if (submitted) return;
      setSubmitted(choice);
      onSubmit(choice);
    },
    [submitted, onSubmit],
  );

  useEffect(() => {
    if (submitted) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit("unsure");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [submitted, handleSubmit]);

  const guide = submitted ? ACTION_GUIDE[submitted] : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      {/* Topic Context */}
      {topicTitle && (
        <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2">
          <p className="text-xs text-gray-400">어제 대화 주제</p>
          <p className="text-sm font-medium text-gray-700">{topicTitle}</p>
          {opponentKeyPoint && (
            <p className="mt-1 text-xs text-gray-500 italic">
              &ldquo;{opponentKeyPoint}&rdquo;
            </p>
          )}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-base font-semibold text-gray-900">
          대화 이후, 생각이 바뀌었나요?
        </p>
        {!submitted && (
          <span className="text-sm tabular-nums text-gray-400">{remaining}s</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {choices.map((choice) => (
          <button
            key={choice.value}
            type="button"
            disabled={submitted !== null}
            onClick={() => handleSubmit(choice.value)}
            className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
              submitted === choice.value
                ? "border-blue-300 bg-blue-50 text-blue-700 font-medium"
                : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            }`}
          >
            {choice.emoji} {choice.label}
          </button>
        ))}
      </div>

      {/* Next Action Guide */}
      {guide && (
        <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/50 px-4 py-3">
          <p className="text-sm text-indigo-700">
            {guide.emoji} {guide.text}
          </p>
        </div>
      )}
    </div>
  );
}
