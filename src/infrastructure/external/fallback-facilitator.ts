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

  async suggestReceptivenessTemplate(): Promise<string[]> {
    return [
      "상대의 관점도 이해할 수 있어요. 제 생각에는...",
      "그 점은 동의합니다. 다만...",
    ];
  }
}
