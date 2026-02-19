export interface JointSummaryOutput {
  sessionId: string;
  agreedPoints: string[];
  disagreedPoints: string[];
  sharedQuestions: string[];
  llmGenerated: boolean;
}
