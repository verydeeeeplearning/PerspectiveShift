"use client";

import type { PercentileOutput } from "@/application/dtos/thought-map-output";
import { DIMENSION_POLES } from "@/domain/value-objects/stance-dimension";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";

interface PercentileDisplayProps {
  percentiles: PercentileOutput[];
}

export function PercentileDisplay({ percentiles }: PercentileDisplayProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">차원별 백분위</h3>
      {percentiles.map((p) => {
        const poles = DIMENSION_POLES[p.dimension as StanceDimension];
        return (
          <div key={p.dimension} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{p.label}</span>
              <span className="text-gray-500">
                상위 {100 - p.percentile}%
              </span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${p.percentile}%` }}
                role="meter"
                aria-valuenow={p.percentile}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${p.label} 백분위: ${p.percentile}%`}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{poles?.low}</span>
              <span>{poles?.high}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
