"use client";

import type { PercentileOutput } from "@/application/dtos/thought-map-output";
import { DIMENSION_POLES } from "@/domain/value-objects/stance-dimension";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";

interface PercentileDisplayProps {
  percentiles: PercentileOutput[];
  baselineLabel?: string;
}

function getBarColor(percentile: number): string {
  if (percentile <= 20 || percentile >= 80)
    return "bg-semantic-difference";
  if (percentile <= 35 || percentile >= 65)
    return "bg-accent-primary";
  return "bg-semantic-similarity";
}

function getPercentileText(percentile: number): string {
  if (percentile >= 50) {
    return `상위 ${100 - percentile}%`;
  }
  return `하위 ${percentile}%`;
}

export function PercentileDisplay({ percentiles, baselineLabel }: PercentileDisplayProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-lg font-heading font-semibold text-text-primary">
          차원별 백분위
        </h3>
        {baselineLabel && (
          <p className="text-xs text-text-tertiary">
            {baselineLabel}
          </p>
        )}
      </div>
      {percentiles.map((p) => {
        const poles = DIMENSION_POLES[p.dimension as StanceDimension];
        const barColor = getBarColor(p.percentile);
        return (
          <div key={p.dimension} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-text-primary">{p.label}</span>
              <span className="text-text-secondary font-medium">
                {getPercentileText(p.percentile)}
              </span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface-sunken">
              <div
                className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
                style={{ width: `${p.percentile}%` }}
                role="meter"
                aria-valuenow={p.percentile}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${p.label} 백분위: ${p.percentile}%`}
              />
              {/* Position marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-text-primary rounded-full shadow-sm"
                style={{ left: `${p.percentile}%`, transform: `translateX(-50%) translateY(-50%)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-text-tertiary">
              <span>{poles?.low}</span>
              <span>{poles?.high}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
