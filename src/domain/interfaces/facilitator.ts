export interface ToneCheckResult {
  passed: boolean;
  suggestion: string | null;
}

export interface DriftCheckResult {
  drifted: boolean;
  suggestion: string | null;
}

export interface Facilitator {
  checkTone(content: string): Promise<ToneCheckResult>;
  checkDrift(
    content: string,
    originalPosition: string,
  ): Promise<DriftCheckResult>;
  suggestReceptivenessTemplate(text: string): Promise<string[]>;
}
