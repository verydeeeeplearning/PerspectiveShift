export interface EvaluationResult {
  receptivenessRatio: number;
  summaryAccuracy: number;
  personalAttackFrequency: number;
  topicDriftFrequency: number;
}

export interface LlmEvaluator {
  evaluate(messages: string[]): Promise<EvaluationResult>;
}

const RECEPTIVE_PATTERNS = [
  /일리가 있/,
  /동의/,
  /이해/,
  /맞는 말/,
  /그 점은/,
  /좋은 지적/,
  /생각해보면/,
];

const ATTACK_PATTERNS = [
  /무식/,
  /멍청/,
  /바보/,
  /한심/,
  /어리석/,
  /너는.*때문에/,
];

export class FallbackLlmEvaluator implements LlmEvaluator {
  async evaluate(messages: string[]): Promise<EvaluationResult> {
    if (messages.length === 0) {
      return { receptivenessRatio: 0, summaryAccuracy: 0.5, personalAttackFrequency: 0, topicDriftFrequency: 0 };
    }

    let receptiveCount = 0;
    let attackCount = 0;

    for (const msg of messages) {
      if (RECEPTIVE_PATTERNS.some((p) => p.test(msg))) receptiveCount++;
      if (ATTACK_PATTERNS.some((p) => p.test(msg))) attackCount++;
    }

    return {
      receptivenessRatio: receptiveCount / messages.length,
      summaryAccuracy: 0.5, // fallback: unknown
      personalAttackFrequency: attackCount / messages.length,
      topicDriftFrequency: 0, // fallback: unknown
    };
  }
}
