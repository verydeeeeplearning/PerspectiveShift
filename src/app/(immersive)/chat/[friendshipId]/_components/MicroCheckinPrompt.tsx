"use client";

import { useState } from "react";

export interface MicroCheckinPromptProps {
  prompt: string;
  onSubmit: (response: string) => void;
  onSkip: () => void;
}

export function MicroCheckinPrompt({
  prompt,
  onSubmit,
  onSkip,
}: MicroCheckinPromptProps) {
  const [response, setResponse] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (response.trim()) {
      onSubmit(response.trim());
    }
  }

  return (
    <div
      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4"
      role="region"
      aria-label="마이크로 체크인"
    >
      <p className="text-sm font-medium text-yellow-800 mb-2">
        잠깐, 대화를 돌아볼까요?
      </p>
      <p className="text-sm text-yellow-700 mb-3">{prompt}</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          className="w-full border rounded-lg p-2 text-sm mb-2"
          placeholder="간단히 적어보세요..."
          aria-label="체크인 응답"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!response.trim()}
            className="flex-1 bg-yellow-600 text-white py-1.5 rounded-lg text-sm disabled:opacity-50"
          >
            응답
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 bg-gray-200 text-gray-700 py-1.5 rounded-lg text-sm"
          >
            건너뛰기
          </button>
        </div>
      </form>
    </div>
  );
}
