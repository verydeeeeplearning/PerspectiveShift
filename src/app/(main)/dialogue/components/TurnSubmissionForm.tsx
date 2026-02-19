"use client";

import { useState } from "react";

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

interface TurnSubmissionFormProps {
  currentStep: string;
  onSubmit: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function TurnSubmissionForm({
  currentStep,
  onSubmit,
  disabled = false,
}: TurnSubmissionFormProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const prompt = STEP_PROMPTS[currentStep] ?? STEP_PROMPTS.POSITION;

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
