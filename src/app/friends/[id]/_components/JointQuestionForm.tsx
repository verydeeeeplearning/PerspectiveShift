"use client";

import { useState } from "react";

export interface JointQuestionFormProps {
  sessionId: string;
  onSubmit: (data: { proposedQuestion: string }) => void;
  disabled?: boolean;
}

export function JointQuestionForm({
  sessionId,
  onSubmit,
  disabled = false,
}: JointQuestionFormProps) {
  const [proposedQuestion, setProposedQuestion] = useState("");

  const canSubmit = proposedQuestion.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ proposedQuestion: proposedQuestion.trim() });
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Joint Question">
      <h3 className="text-lg font-semibold mb-4">Joint Question</h3>
      <p className="text-sm text-gray-600 mb-4">
        우리 둘 다 답을 모르는 질문 1개를 함께 만들어봐요 (5분)
      </p>

      <div>
        <label htmlFor={`question-${sessionId}`} className="block text-sm font-medium mb-1">
          함께 만들 질문
        </label>
        <textarea
          id={`question-${sessionId}`}
          value={proposedQuestion}
          onChange={(e) => setProposedQuestion(e.target.value)}
          className="w-full border rounded-lg p-2 text-sm"
          rows={3}
          placeholder="우리 둘 다 답하기 어려운 질문은..."
          disabled={disabled}
        />
      </div>

      <button
        type="submit"
        disabled={disabled || !canSubmit}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
      >
        질문 제안하기
      </button>
    </form>
  );
}
