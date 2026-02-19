export interface JointSummaryOutput {
  sessionId: string;
  agreedPoints: string[];
  disagreedPoints: string[];
  sharedQuestions: string[];
  llmGenerated: boolean;
  // v4 P0-D2 enhanced fields (optional for backwards compatibility)
  topic?: string;
  date?: string;
  myKeyPoint?: string;
  opponentKeyPoint?: string;
  commonGround?: string | null;
  newDiscovery?: string | null;
  understandingScore?: number;
  feelHeardScore?: number;
  autoSaved?: boolean;
}
