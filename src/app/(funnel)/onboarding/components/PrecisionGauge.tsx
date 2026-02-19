"use client";

import type { PrecisionMilestone } from "@/domain/value-objects/precision-score";

interface PrecisionGaugeProps {
  precision: number;
  label: string;
  nextMilestone?: PrecisionMilestone | null;
  onUpgrade: () => void;
}

export function PrecisionGauge({
  precision,
  label,
  nextMilestone,
  onUpgrade,
}: PrecisionGaugeProps) {
  return (
    <div className="w-full rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          분석 정밀도
        </span>
        <span className="text-sm font-semibold text-gray-900">
          {label}
        </span>
      </div>

      <div
        className="mb-1 flex items-center gap-3"
        role="progressbar"
        aria-valuenow={precision}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
            style={{ width: `${precision}%` }}
          />
        </div>
        <span className="min-w-[3rem] text-right text-lg font-bold text-blue-600">
          {precision}%
        </span>
      </div>

      {nextMilestone && (
        <button
          type="button"
          onClick={onUpgrade}
          className="mt-3 w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
        >
          정밀도 올리기 — {nextMilestone.additionalQuestions}문항 추가 (약{" "}
          {nextMilestone.estimatedMinutes}분)
        </button>
      )}
    </div>
  );
}
