"use client";

import { useState } from "react";

interface CommonGroundCardProps {
  onSubmit: (data: { mostConvincingPoint: string; nextQuestion: string }) => void;
}

export function CommonGroundCard({ onSubmit }: CommonGroundCardProps) {
  const [convincing, setConvincing] = useState("");
  const [nextQ, setNextQ] = useState("");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-900">
          상대방의 주장 중 가장 설득력 있었던 부분
        </label>
        <input
          role="textbox"
          type="text"
          value={convincing}
          onChange={(e) => setConvincing(e.target.value)}
          placeholder="예: 경제적 효율성 논거가 인상적이었어요"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-900">
          다음엔 이것을 더 묻고 싶다
        </label>
        <input
          role="textbox"
          type="text"
          value={nextQ}
          onChange={(e) => setNextQ(e.target.value)}
          placeholder="예: AI 교육 접근성은 어떻게 보장할 수 있을까?"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
        />
      </div>

      <button
        type="button"
        aria-label="완료"
        onClick={() => onSubmit({ mostConvincingPoint: convincing, nextQuestion: nextQ })}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        완료
      </button>
    </div>
  );
}
