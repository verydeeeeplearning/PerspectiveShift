"use client";

import type { MisperceptionOutput } from "@/application/dtos/misperception-output";
import { DIMENSION_LABELS } from "@/domain/value-objects/stance-dimension";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";

interface MisperceptionCardProps {
  result: MisperceptionOutput;
}

export function MisperceptionCard({ result }: MisperceptionCardProps) {
  const label = DIMENSION_LABELS[result.dimension as StanceDimension];

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">{label}</h4>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            result.isAccurate
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {result.isAccurate ? "정확" : "오해"}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">내 예측</span>
          <span className="font-medium">{formatValue(result.userPrediction)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">실제 평균</span>
          <span className="font-medium">{formatValue(result.actualBaseline)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">차이</span>
          <span className="font-medium text-gray-700">
            {result.gapPercentage}%
          </span>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div
            className={`h-2 rounded-full ${
              result.isAccurate ? "bg-green-400" : "bg-red-400"
            }`}
            style={{ width: `${Math.min(result.gapPercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function formatValue(v: number): string {
  return v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2);
}
