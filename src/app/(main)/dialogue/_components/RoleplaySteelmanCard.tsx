"use client";

import { useState } from "react";

interface RoleplaySteelmanCardProps {
  prompt: string;
  canSkip: boolean;
  onComplete: (response: string) => void;
  onSkip: () => void;
  dialogueCount?: number;
}

function getExposureCopy(dialogueCount: number): {
  title: string;
  helper: string;
  emphasisClassName: string;
} {
  if (dialogueCount <= 3) {
    return {
      title: "상대 입장에서 한 번 말해볼래요?",
      helper: "지금은 선택 단계예요. 짧게 시도해도 충분해요.",
      emphasisClassName: "bg-gray-50 border-gray-200 text-gray-700",
    };
  }
  if (dialogueCount <= 6) {
    return {
      title: "상대 입장을 이해하는 데 도움이 돼요",
      helper: "조금만 바꿔 말해봐도 이해 점수가 빠르게 올라가요.",
      emphasisClassName: "bg-amber-50 border-amber-200 text-amber-800",
    };
  }
  return {
    title: "이번엔 기본 노출 단계예요",
    helper: "건너뛰기는 가능하지만, 한 문장만 써도 대화 품질이 좋아져요.",
    emphasisClassName: "bg-blue-50 border-blue-200 text-blue-800",
  };
}

export function RoleplaySteelmanCard({
  prompt,
  canSkip,
  onComplete,
  onSkip,
  dialogueCount = 1,
}: RoleplaySteelmanCardProps) {
  const [text, setText] = useState("");
  const exposure = getExposureCopy(dialogueCount);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">🎭</span>
        <p className="text-sm font-semibold text-gray-900">
          {exposure.title}
        </p>
      </div>

      <p className={`mb-3 rounded-lg border p-3 text-xs ${exposure.emphasisClassName}`}>
        {exposure.helper}
      </p>

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
