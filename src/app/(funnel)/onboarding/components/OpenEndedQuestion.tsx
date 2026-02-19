"use client";

import { useState } from "react";

interface ResponseExample {
  kind: "주장형" | "경험형" | "불확실형";
  text: string;
  coach: string;
}

const DEFAULT_EXAMPLES: ResponseExample[] = [
  {
    kind: "주장형",
    text: "핵심은 실행 가능한 정책입니다. 이상보다 현실을 먼저 봐야 해요.",
    coach: "주장의 근거 한 가지를 함께 적으면 설득력이 올라가요.",
  },
  {
    kind: "경험형",
    text: "현장에서 겪어보니 제도보다 운영 방식이 더 큰 영향을 줬어요.",
    coach: "경험의 맥락(언제/어디서)을 한 줄만 추가해보세요.",
  },
  {
    kind: "불확실형",
    text: "아직 확신은 없지만, 속도보다 안전장치를 먼저 만드는 게 낫다고 느껴요.",
    coach: "불확실해도 괜찮아요. 현재의 기울기만 적어도 충분합니다.",
  },
];

interface OpenEndedQuestionProps {
  questionId: number;
  text: string;
  onAnswer: (questionId: number, value: string) => void;
  initialValue?: string;
  examples?: ResponseExample[];
  tooltipText?: string;
  onExampleSwipe?: () => void;
  onCoachClick?: () => void;
}

export function OpenEndedQuestion({
  questionId,
  text,
  onAnswer,
  initialValue = "",
  examples = DEFAULT_EXAMPLES,
  tooltipText,
  onExampleSwipe,
  onCoachClick,
}: OpenEndedQuestionProps) {
  const [value, setValue] = useState(initialValue);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  const handleSubmit = () => {
    if (value.trim().length > 0) {
      onAnswer(questionId, value.trim());
    }
  };

  const handleNextExample = () => {
    setExampleIndex((prev) => (prev + 1) % examples.length);
    onExampleSwipe?.();
  };

  const handlePrevExample = () => {
    setExampleIndex((prev) => (prev - 1 + examples.length) % examples.length);
    onExampleSwipe?.();
  };

  const currentExample = examples[exampleIndex];

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

      <div
        className="w-full max-w-lg rounded-lg border border-gray-200 bg-gray-50 p-3"
        role="region"
        aria-label="답변 예시"
      >
        <p className="text-xs font-semibold text-gray-500">
          예시 {exampleIndex + 1}/{examples.length} · {currentExample.kind}
        </p>
        <p className="mt-1 text-sm text-gray-700">{currentExample.text}</p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={handlePrevExample}
            className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600"
            aria-label="이전 예시"
          >
            이전
          </button>
          <button
            type="button"
            onClick={handleNextExample}
            className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600"
            aria-label="다음 예시"
          >
            다음
          </button>
          <button
            type="button"
            onClick={() => {
              onCoachClick?.();
              setIsCoachOpen((prev) => !prev);
            }}
            className="ml-auto rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
          >
            Coach
          </button>
        </div>
        {isCoachOpen && (
          <p className="mt-2 text-xs text-blue-700" role="note">
            {currentExample.coach}
          </p>
        )}
      </div>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="자유롭게 작성해주세요..."
        className="w-full max-w-lg rounded-lg border border-gray-300 p-4 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        rows={4}
        maxLength={2000}
        aria-label={text}
      />
      <div className="flex w-full max-w-lg items-center justify-between">
        <span className="text-sm text-gray-400">
          {value.length}/2000
        </span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={value.trim().length === 0}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-all hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          확인
        </button>
      </div>
    </div>
  );
}
