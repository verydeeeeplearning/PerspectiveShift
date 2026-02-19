"use client";

import type { ToneAlternative, ToneUserChoice } from "@/domain/value-objects/tone-suggestion";

interface ToneCheckPanelProps {
  originalText: string;
  alternatives: readonly ToneAlternative[];
  onSelect: (choice: ToneUserChoice) => void;
}

export function ToneCheckPanel({ originalText, alternatives, onSelect }: ToneCheckPanelProps) {
  const choiceKeys: ToneUserChoice[] = ["USE_ALTERNATIVE_A", "USE_ALTERNATIVE_B", "USE_ALTERNATIVE_C"];

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-3" role="region" aria-label="톤 체크 제안">
      <h3 className="text-sm font-semibold text-blue-800">
        더 잘 전달되는 표현이 있어요
      </h3>
      <p className="text-xs text-gray-500">원문: {originalText}</p>
      <div className="space-y-2">
        {alternatives.map((alt, i) => (
          <button
            key={alt.category}
            className="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:border-blue-300 transition-colors"
            onClick={() => onSelect(choiceKeys[i])}
            aria-label={`${alt.label}: ${alt.text}`}
          >
            <span className="text-xs text-blue-600 font-medium">{alt.label}</span>
            <p className="text-sm mt-1">{alt.text}</p>
          </button>
        ))}
      </div>
      <button
        className="w-full text-center text-sm text-gray-500 py-2 hover:text-gray-700"
        onClick={() => onSelect("SEND_ORIGINAL")}
        aria-label="원래대로 보내기"
      >
        원래대로 보내기
      </button>
    </div>
  );
}
