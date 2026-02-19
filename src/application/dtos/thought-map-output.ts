import type { StanceDimension } from "@/domain/value-objects/stance-dimension";
import type { MapTypeName } from "@/domain/value-objects/map-type";
import type { ThoughtMapAliasKey } from "@/domain/value-objects/thought-map-alias";

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

export interface AliasOutput {
  key: ThoughtMapAliasKey;
  label: string;
  emoji: string;
  description: string;
}

export interface ThoughtMapOutput {
  sessionId: string;
  vector: Record<StanceDimension, number>;
  mapType: MapTypeOutput;
  alias: AliasOutput;
  percentiles: PercentileOutput[];
  precision: "initial" | "refined";
  baselineLabel: string;
}
