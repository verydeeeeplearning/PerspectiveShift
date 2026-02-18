import type {
  Facilitator,
  ToneCheckResult,
  DriftCheckResult,
} from "@/domain/interfaces/facilitator";

export class FallbackFacilitator implements Facilitator {
  async checkTone(): Promise<ToneCheckResult> {
    return { passed: true, suggestion: null };
  }

  async checkDrift(): Promise<DriftCheckResult> {
    return { drifted: false, suggestion: null };
  }
}
