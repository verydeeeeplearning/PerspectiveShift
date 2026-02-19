export interface FeedbackOutput {
  id: string;
  sessionId: string;
  satisfaction: number;
  feelHeardScore: number;
  affectiveWarmth: number;
  rematchWillingness: boolean;
  emotionCheckIn: string | null;
  createdAt: string;
}

export interface UnderstandingScoreOutput {
  id: string;
  sessionId: string;
  participantId: string;
  score: number;
  evaluation: string;
  createdAt: string;
}

export interface SummaryCardOutput {
  id: string;
  sessionId: string;
  keyArguments: { participantA: string[]; participantB: string[] };
  commonGround: string[];
  unresolvedQuestions: string[];
  blindSpots: string[];
  createdAt: string;
}
