"use client";

import type { ThoughtMapOutput } from "@/application/dtos/thought-map-output";
import { ThoughtMapChart } from "./ThoughtMapChart";
import { TypeAlias } from "./TypeAlias";
import { AliasCard } from "./AliasCard";
import { PercentileDisplay } from "./PercentileDisplay";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";

interface ThoughtMapResultProps {
  data: ThoughtMapOutput;
}

export function ThoughtMapResult({ data }: ThoughtMapResultProps) {
  return (
    <div className="flex flex-col gap-8">
      <TypeAlias mapType={data.mapType} />

      {data.alias && <AliasCard alias={data.alias} />}

      <ThoughtMapChart
        vector={data.vector as Record<StanceDimension, number>}
      />

      <PercentileDisplay percentiles={data.percentiles} />

      <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
        <p>
          {data.precision === "refined"
            ? "확장 질문 포함 정밀 프로필"
            : "핵심 질문 기반 초기 프로필"}
        </p>
        <p className="mt-1">{data.baselineLabel}</p>
      </div>
    </div>
  );
}
