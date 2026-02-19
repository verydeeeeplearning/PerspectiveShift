"use client";

import { useState } from "react";

interface TapHighlightProps {
  text: string;
  segments: Array<{
    id: string;
    text: string;
    startIndex: number;
    endIndex: number;
    isHighlighted: boolean;
  }>;
  onSegmentTap: (segmentId: string) => void;
  onInsertQuote: (text: string) => void;
}

export function TapHighlight({
  segments,
  onSegmentTap,
  onInsertQuote,
}: TapHighlightProps) {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    null,
  );

  return (
    <div
      className="space-y-1"
      role="list"
      aria-label="하이라이트 가능한 텍스트"
    >
      {segments.map((seg) => (
        <button
          key={seg.id}
          role="listitem"
          className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
            seg.isHighlighted
              ? "bg-yellow-100 border-l-4 border-yellow-400"
              : "hover:bg-gray-50"
          }`}
          onClick={() => {
            onSegmentTap(seg.id);
            setSelectedSegmentId(seg.isHighlighted ? null : seg.id);
          }}
          aria-pressed={seg.isHighlighted}
          aria-label={`문장: ${seg.text}`}
        >
          <span className="text-sm leading-relaxed">{seg.text}</span>
        </button>
      ))}
      {segments.some((s) => s.isHighlighted) && (
        <div className="pt-2 border-t">
          <button
            className="text-sm text-blue-600 font-medium"
            onClick={() => {
              const highlighted = segments
                .filter((s) => s.isHighlighted)
                .map((s) => s.text);
              onInsertQuote(highlighted.join(" "));
            }}
          >
            질문에 인용하기
          </button>
        </div>
      )}
    </div>
  );
}
