import type { StanceDimension } from "@/domain/value-objects/stance-dimension";
import type { MapTypeName } from "@/domain/value-objects/map-type";

export interface PercentileOutput {
  dimension: StanceDimension;
  label: string;
  percentile: number;
  value: number;
}

export interface MapTypeOutput {
  name: MapTypeName;
  alias: string;
  emoji: string;
  description: string;
}

export interface ThoughtMapOutput {
  sessionId: string;
  vector: Record<StanceDimension, number>;
  mapType: MapTypeOutput;
  percentiles: PercentileOutput[];
  precision: "initial" | "refined";
  baselineLabel: string;
}
