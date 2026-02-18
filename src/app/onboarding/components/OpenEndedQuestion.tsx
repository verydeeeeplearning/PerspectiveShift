"use client";

import { useState } from "react";

interface OpenEndedQuestionProps {
  questionId: number;
  text: string;
  onAnswer: (questionId: number, value: string) => void;
  initialValue?: string;
}

export function OpenEndedQuestion({
  questionId,
  text,
  onAnswer,
  initialValue = "",
}: OpenEndedQuestionProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = () => {
    if (value.trim().length > 0) {
      onAnswer(questionId, value.trim());
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-center text-lg font-medium leading-relaxed">
        {text}
      </p>
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
