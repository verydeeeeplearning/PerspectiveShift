export interface ToneAlternative {
  text: string;
  style: "softer" | "question" | "acknowledging";
}

export interface ToneCheckResult {
  passed: boolean;
  suggestion: string | null;
  alternatives: ToneAlternative[];
}

export interface DriftCheckResult {
  drifted: boolean;
  suggestion: string | null;
}

export interface DetectedReceptiveExpression {
  expression: string;
  suggestedResponse: string;
}

export interface Facilitator {
  checkTone(content: string): Promise<ToneCheckResult>;
  checkDrift(
    content: string,
    originalPosition: string,
  ): Promise<DriftCheckResult>;
  suggestReceptivenessTemplate(text: string): Promise<string[]>;
  detectReceptiveExpressions(opponentText: string): Promise<DetectedReceptiveExpression[]>;
}
