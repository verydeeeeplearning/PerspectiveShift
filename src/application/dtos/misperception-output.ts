import type { StanceDimension } from "@/domain/value-objects/stance-dimension";

export interface MisperceptionOutput {
  dimension: StanceDimension;
  userPrediction: number;
  actualBaseline: number;
  gap: number;
  gapPercentage: number;
  isAccurate: boolean;
}
