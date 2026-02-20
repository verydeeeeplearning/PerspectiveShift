import type {
  Facilitator,
  ToneCheckResult,
  DriftCheckResult,
  DetectedReceptiveExpression,
} from "@/domain/interfaces/facilitator";

export class FallbackFacilitator implements Facilitator {
  async checkTone(_content: string): Promise<ToneCheckResult> {
    return { passed: true, suggestion: null, alternatives: [] };
  }

  async checkDrift(
    _content: string,
    _originalPosition: string,
  ): Promise<DriftCheckResult> {
    return { drifted: false, suggestion: null };
  }

  async detectReceptiveExpressions(
    _opponentText: string,
  ): Promise<DetectedReceptiveExpression[]> {
    return [];
  }

  async suggestReceptivenessTemplate(_text: string): Promise<string[]> {
    return [
      "상대의 관점도 이해할 수 있어요. 제 생각에는...",
      "그 점은 동의합니다. 다만...",
    ];
  }
}
