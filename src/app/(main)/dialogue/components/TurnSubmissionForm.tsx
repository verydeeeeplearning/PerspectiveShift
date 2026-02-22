"use client";

import { useState } from "react";
import { useInactivityTimer } from "@/app/_shared/hooks/useInactivityTimer";

const STEP_PROMPTS: Record<string, { title: string; placeholder: string }> = {
  POSITION: {
    title: "당신의 입장을 공유하세요",
    placeholder: "이 주제에 대한 당신의 의견과 그 근거를 적어주세요... (최소 10자)",
  },
  QUESTION: {
    title: "상대에게 질문하세요",
    placeholder: "상대의 입장에서 궁금한 점이나 이해하고 싶은 부분을 질문해주세요...",
  },
  ANSWER: {
    title: "상대의 질문에 답변하세요",
    placeholder: "상대의 질문에 성실하게 답변해주세요...",
  },
  REFLECTION: {
    title: "대화를 성찰하세요",
    placeholder: "이 대화를 통해 배운 점, 이해하게 된 점, 여전히 다른 점을 정리해주세요...",
  },
};

const STEP_EXAMPLES: Record<string, string[]> = {
  POSITION: [
    "저는 이 정책이 장기적으로 더 많은 사람에게 도움이 된다고 봅니다.",
    "개인의 선택권이 보장되는 것이 더 중요하다고 생각합니다.",
    "현실적인 실행 가능성을 먼저 고려해야 한다고 봅니다.",
  ],
  QUESTION: [
    "그 입장을 갖게 된 계기가 있을까요?",
    "혹시 반대 상황도 고려해보셨나요?",
    "가장 걱정되는 부분은 어떤 건가요?",
  ],
  ANSWER: [
    "좋은 질문이에요. 저는 이렇게 생각하게 되었는데...",
    "그 부분은 저도 고민했어요. 제 경험으로는...",
    "맞아요, 그 점은 인정해요. 그래서 저는...",
  ],
  REFLECTION: [
    "상대의 논거 중 이 부분이 새롭게 와 닿았습니다.",
    "제 입장은 유지하지만, 이 점은 재고해볼 필요가 있다고 느꼈습니다.",
    "서로 같은 목표를 다른 방식으로 추구하고 있다는 걸 알게 됐습니다.",
  ],
};

interface TurnSubmissionFormProps {
  currentStep: string;
  topic?: string;
  onSubmit: (content: string) => Promise<void>;
  disabled?: boolean;
  onCoachOpen?: () => void;
}

export function TurnSubmissionForm({
  currentStep,
  topic,
  onSubmit,
  disabled = false,
  onCoachOpen,
}: TurnSubmissionFormProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [exampleIdx, setExampleIdx] = useState(0);
  const [isCoachHighlighted, setIsCoachHighlighted] = useState(false);
  const topicLabel = topic?.trim() || "자유 주제";
  const promptBase = STEP_PROMPTS[currentStep] ?? STEP_PROMPTS.POSITION;
  const prompt =
    currentStep === "POSITION"
      ? {
          ...promptBase,
          placeholder:
            `주제: ${topicLabel}\n\n` +
            "이 주제에 대한 당신의 의견과 그 근거를 적어주세요... (최소 10자)",
        }
      : promptBase;
  const examples = STEP_EXAMPLES[currentStep] ?? STEP_EXAMPLES.POSITION;
  const inactive = useInactivityTimer(90_000);

  // Highlight coach button after 90s inactivity
  if (inactive && !isCoachHighlighted) {
    setIsCoachHighlighted(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.length < 10 || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(content);
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-medium text-lg">{prompt.title}</h3>

      {/* Example carousel */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="text-xs font-semibold text-gray-500">
          예시 {exampleIdx + 1}/{examples.length}
        </p>
        <p className="mt-1 text-sm text-gray-600">{examples[exampleIdx]}</p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setExampleIdx((i) => (i - 1 + examples.length) % examples.length)}
            className="rounded border px-2 py-0.5 text-xs text-gray-500"
            aria-label="이전 예시"
          >
            이전
          </button>
          <button
            type="button"
            onClick={() => setExampleIdx((i) => (i + 1) % examples.length)}
            className="rounded border px-2 py-0.5 text-xs text-gray-500"
            aria-label="다음 예시"
          >
            다음
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCoachHighlighted(false);
              onCoachOpen?.();
            }}
            className={`ml-auto rounded-md px-2 py-0.5 text-xs font-medium ${
              isCoachHighlighted
                ? "animate-pulse bg-blue-500 text-white"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            Coach
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={prompt.placeholder}
        maxLength={3000}
        rows={6}
        disabled={disabled || submitting}
        className="w-full border rounded-lg p-3 resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-50"
        aria-label={prompt.title}
      />
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">
          {content.length}/3000
        </span>
        <button
          type="submit"
          disabled={content.length < 10 || disabled || submitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "제출 중..." : "제출"}
        </button>
      </div>
    </form>
  );
}
