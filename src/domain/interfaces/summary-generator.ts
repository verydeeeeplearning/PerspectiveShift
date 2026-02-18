import type { DialogueTurn } from "../entities/dialogue-turn";

export interface SummaryResult {
  keyArguments: { participantA: string[]; participantB: string[] };
  commonGround: string[];
  unresolvedQuestions: string[];
  blindSpots: string[];
}

export interface UnderstandingResult {
  score: number;
  evaluation: string;
}

export interface SummaryGenerator {
  generateSummary(
    turns: DialogueTurn[],
    participantA: string,
    participantB: string,
  ): Promise<SummaryResult>;

  evaluateUnderstanding(
    reflectionContent: string,
    opponentTurns: DialogueTurn[],
  ): Promise<UnderstandingResult>;
}
