import type { DialogueFeedback } from "../entities/dialogue-feedback";
import type { UnderstandingScore } from "../entities/understanding-score";
import type { SummaryCard } from "../entities/summary-card";

export interface FeedbackRepository {
  saveFeedback(feedback: DialogueFeedback): Promise<void>;

  findFeedback(
    sessionId: string,
    participantId: string,
  ): Promise<DialogueFeedback | null>;

  saveUnderstandingScore(score: UnderstandingScore): Promise<void>;

  findUnderstandingScore(
    sessionId: string,
    participantId: string,
  ): Promise<UnderstandingScore | null>;

  saveSummaryCard(card: SummaryCard): Promise<void>;

  findSummaryCard(sessionId: string): Promise<SummaryCard | null>;
}
