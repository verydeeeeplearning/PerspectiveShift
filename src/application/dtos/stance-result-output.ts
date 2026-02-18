import type { StanceDimension } from "@/domain/value-objects/stance-dimension";

export interface StanceResultOutput {
  sessionId: string;
  vector: Record<StanceDimension, number>;
  precision: "initial" | "refined";
  reasoning: string | null;
  readiness: number;
}
