"use client";

import { useState } from "react";

interface RoleplaySteelmanCardProps {
  prompt: string;
  canSkip: boolean;
  onComplete: (response: string) => void;
  onSkip: () => void;
}

export function RoleplaySteelmanCard({
  prompt,
  canSkip,
  onComplete,
  onSkip,
}: RoleplaySteelmanCardProps) {
  const [text, setText] = useState("");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">🎭</span>
        <p className="text-sm font-semibold text-gray-900">
          30초 동안 상대방 입장에서 내 주장을 비판해보세요
        </p>
      </div>

      <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
        {prompt}
      </p>

      <textarea
        role="textbox"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="상대방의 시각에서 생각해보면..."
        className="mb-3 w-full rounded-lg border border-gray-200 p-3 text-sm"
        rows={3}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onComplete(text)}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          작성 완료
        </button>
        {canSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}
