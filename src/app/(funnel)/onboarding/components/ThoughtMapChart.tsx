"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";
import {
  DIMENSION_LABELS,
  DIMENSION_POLES,
} from "@/domain/value-objects/stance-dimension";

interface ChartDataPoint {
  dimension: StanceDimension;
  label: string;
  value: number;
  normalizedValue: number;
}

interface ThoughtMapChartProps {
  vector: Record<StanceDimension, number>;
}

export function ThoughtMapChart({ vector }: ThoughtMapChartProps) {
  const data: ChartDataPoint[] = Object.entries(vector).map(
    ([dim, value]) => {
      const dimension = dim as StanceDimension;
      return {
        dimension,
        label: DIMENSION_LABELS[dimension],
        value,
        normalizedValue: (value + 1) / 2,
      };
    },
  );

  return (
    <div className="w-full" aria-label="Thought Map 레이더 차트">
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#4b5563" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 1]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="나의 스탠스"
            dataKey="normalizedValue"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.[0]) return null;
              const item = payload[0].payload as ChartDataPoint;
              const poles = DIMENSION_POLES[item.dimension];
              return (
                <div className="rounded-lg bg-white p-3 shadow-lg">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-gray-600">
                    {poles.low} ← → {poles.high}
                  </p>
                  <p className="text-sm font-bold text-blue-600">
                    {item.value > 0 ? "+" : ""}
                    {item.value.toFixed(2)}
                  </p>
                </div>
              );
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
