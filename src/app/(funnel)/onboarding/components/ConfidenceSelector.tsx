"use client";

import { useState } from "react";
import {
  ALL_DIMENSIONS,
  DIMENSION_LABELS,
  type StanceDimension,
} from "@/domain/value-objects/stance-dimension";

interface ConfidenceSelectorProps {
  onSubmit: (highConfidenceDimensions: StanceDimension[]) => void;
  onSkip: () => void;
}

export function ConfidenceSelector({
  onSubmit,
  onSkip,
}: ConfidenceSelectorProps) {
  const [selected, setSelected] = useState<Set<StanceDimension>>(new Set());

  const toggleDimension = (dim: StanceDimension) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(dim)) {
        next.delete(dim);
      } else {
        next.add(dim);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <h2 className="text-xl font-bold">확신 강도 확인</h2>
      <p className="text-center text-gray-600">
        아래 주제 중 당신의 생각이 가장 확고한 주제는?
      </p>
      <p className="text-center text-sm text-gray-400">
        복수 선택 가능 · 선택하지 않아도 됩니다
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ALL_DIMENSIONS.map((dim) => (
          <button
            key={dim}
            type="button"
            onClick={() => toggleDimension(dim)}
            className={`rounded-xl border-2 px-4 py-3 text-center text-sm transition-all ${
              selected.has(dim)
                ? "border-blue-500 bg-blue-50 font-semibold text-blue-700"
                : "border-gray-200 hover:border-blue-300"
            }`}
            aria-label={`주제 선택: ${DIMENSION_LABELS[dim]}`}
            aria-pressed={selected.has(dim)}
          >
            {DIMENSION_LABELS[dim]}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onSubmit(Array.from(selected))}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          다음
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
}
