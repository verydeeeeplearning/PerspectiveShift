"use client";

import { useState } from "react";

interface MutualVerificationSliderProps {
  summary: string;
  onSubmit: (value: number, correction: string | null) => void;
}

export function MutualVerificationSlider({ summary, onSubmit }: MutualVerificationSliderProps) {
  const [value, setValue] = useState(50);
  const [showCorrection, setShowCorrection] = useState(false);
  const [correction, setCorrection] = useState("");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="mb-2 text-xs font-semibold text-gray-500 uppercase">상대방이 요약한 내 입장</p>
      <p className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{summary}</p>

      <div className="mb-4">
        <div className="mb-1 flex justify-between text-sm">
          <span>😐</span>
          <span>😊</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {!showCorrection && (
        <button
          type="button"
          onClick={() => setShowCorrection(true)}
          className="mb-3 text-sm text-blue-600 hover:underline"
        >
          수정 제안 추가하기
        </button>
      )}

      {showCorrection && (
        <textarea
          value={correction}
          onChange={(e) => setCorrection(e.target.value)}
          placeholder="조금 다른 부분은..."
          className="mb-3 w-full rounded-lg border border-gray-200 p-3 text-sm"
          rows={2}
        />
      )}

      <button
        type="button"
        aria-label="확인"
        onClick={() => onSubmit(value, correction.trim() || null)}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        확인
      </button>
    </div>
  );
}
