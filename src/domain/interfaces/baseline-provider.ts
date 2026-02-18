import type { StanceDimension } from "../value-objects/stance-dimension";

export interface DimensionDistribution {
  mean: number;
  std: number;
  sampleSize: number;
}

export interface BaselineData {
  dimensions: Record<StanceDimension, DimensionDistribution>;
  label: string;
}

export interface BaselineProvider {
  getBaseline(): BaselineData;
  calculatePercentile(
    dimension: StanceDimension,
    value: number,
  ): number;
}
