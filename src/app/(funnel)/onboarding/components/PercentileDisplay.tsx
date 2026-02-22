"use client";

import type { PercentileOutput } from "@/application/dtos/thought-map-output";
import { DIMENSION_POLES } from "@/domain/value-objects/stance-dimension";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";

interface PercentileDisplayProps {
  percentiles: PercentileOutput[];
  baselineLabel?: string;
}

function getBarColor(percentile: number): string {
  const deviation = Math.abs(percentile - 50);
  if (deviation >= 30) return "bg-semantic-difference";
  if (deviation >= 15) return "bg-accent-primary";
  return "bg-semantic-similarity";
}

function getSpectrumText(
  percentile: number,
  poles: { low: string; high: string } | undefined,
): string {
  const deviation = percentile - 50;
  if (Math.abs(deviation) <= 3) {
    return "중앙";
  }
  if (deviation > 0) {
    return `${poles?.high ?? "우측"} 쪽 ${deviation}%`;
  }
  return `${poles?.low ?? "좌측"} 쪽 ${Math.abs(deviation)}%`;
}

export function PercentileDisplay({ percentiles, baselineLabel }: PercentileDisplayProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-lg font-heading font-semibold text-text-primary">
          가치관 스펙트럼
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
        const deviation = p.percentile - 50;
        const deviationAbs = Math.abs(deviation);
        return (
          <div key={p.dimension} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-text-primary">{p.label}</span>
              <span className="text-text-secondary font-medium">
                {getSpectrumText(p.percentile, poles)}
              </span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface-sunken">
              {/* Center line */}
              <div className="absolute left-1/2 top-0 h-full w-0.5 bg-text-tertiary/40 z-10" />

              {/* Bar extending from center */}
              {deviation >= 0 ? (
                <div
                  className={`absolute top-0 h-full rounded-r-full ${barColor} transition-all duration-700 ease-out`}
                  style={{ left: "50%", width: `${deviationAbs}%` }}
                />
              ) : (
                <div
                  className={`absolute top-0 h-full rounded-l-full ${barColor} transition-all duration-700 ease-out`}
                  style={{ right: "50%", width: `${deviationAbs}%` }}
                />
              )}

              {/* Position marker */}
              <div
                className="absolute top-1/2 w-1 h-4 bg-text-primary rounded-full shadow-sm z-20"
                style={{ left: `${p.percentile}%`, transform: "translateX(-50%) translateY(-50%)" }}
                role="meter"
                aria-valuenow={p.percentile}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${p.label}: ${getSpectrumText(p.percentile, poles)}`}
              />
            </div>
            <div className="flex justify-between text-xs text-text-tertiary">
              <span>{poles?.low}</span>
              <span className="text-text-tertiary/50">중앙</span>
              <span>{poles?.high}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
