import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedbackRepository } from "@/domain/interfaces/feedback-repository";
import { DialogueFeedback } from "@/domain/entities/dialogue-feedback";
import { UnderstandingScore } from "@/domain/entities/understanding-score";
import { SummaryCard } from "@/domain/entities/summary-card";

export class SupabaseFeedbackRepository implements FeedbackRepository {
  constructor(private readonly client: SupabaseClient) {}

  async saveFeedback(feedback: DialogueFeedback): Promise<void> {
    const { error } = await this.client
      .from("dialogue_feedback")
      .insert({
        id: feedback.id,
        session_id: feedback.sessionId,
        participant_id: feedback.participantId,
        satisfaction: feedback.satisfaction,
        rematch_willingness: feedback.rematchWillingness,
        emotion_check_in: feedback.emotionCheckIn,
        created_at: feedback.createdAt.toISOString(),
      });

    if (error) throw new Error(`Failed to save feedback: ${error.message}`);
  }

  async findFeedback(
    sessionId: string,
    participantId: string,
  ): Promise<DialogueFeedback | null> {
    const { data, error } = await this.client
      .from("dialogue_feedback")
      .select("*")
      .eq("session_id", sessionId)
      .eq("participant_id", participantId)
      .maybeSingle();

    if (error) throw new Error(`Failed to find feedback: ${error.message}`);
    if (!data) return null;

    return DialogueFeedback.create({
      id: data.id,
      sessionId: data.session_id,
      participantId: data.participant_id,
      satisfaction: data.satisfaction,
      rematchWillingness: data.rematch_willingness,
      emotionCheckIn: data.emotion_check_in,
      createdAt: new Date(data.created_at),
    });
  }

  async saveUnderstandingScore(score: UnderstandingScore): Promise<void> {
    const { error } = await this.client
      .from("understanding_scores")
      .insert({
        id: score.id,
        session_id: score.sessionId,
        participant_id: score.participantId,
        score: score.score,
        evaluation: score.evaluation,
        created_at: score.createdAt.toISOString(),
      });

    if (error) throw new Error(`Failed to save score: ${error.message}`);
  }

  async findUnderstandingScore(
    sessionId: string,
    participantId: string,
  ): Promise<UnderstandingScore | null> {
    const { data, error } = await this.client
      .from("understanding_scores")
      .select("*")
      .eq("session_id", sessionId)
      .eq("participant_id", participantId)
      .maybeSingle();

    if (error) throw new Error(`Failed to find score: ${error.message}`);
    if (!data) return null;

    return UnderstandingScore.create({
      id: data.id,
      sessionId: data.session_id,
      participantId: data.participant_id,
      score: data.score,
      evaluation: data.evaluation,
      createdAt: new Date(data.created_at),
    });
  }

  async saveSummaryCard(card: SummaryCard): Promise<void> {
    const { error } = await this.client
      .from("summary_cards")
      .insert({
        id: card.id,
        session_id: card.sessionId,
        key_arguments: card.keyArguments,
        common_ground: card.commonGround,
        unresolved_questions: card.unresolvedQuestions,
        blind_spots: card.blindSpots,
        created_at: card.createdAt.toISOString(),
      });

    if (error) throw new Error(`Failed to save summary card: ${error.message}`);
  }

  async findSummaryCard(sessionId: string): Promise<SummaryCard | null> {
    const { data, error } = await this.client
      .from("summary_cards")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (error) throw new Error(`Failed to find summary: ${error.message}`);
    if (!data) return null;

    return SummaryCard.create({
      id: data.id,
      sessionId: data.session_id,
      keyArguments: data.key_arguments,
      commonGround: data.common_ground,
      unresolvedQuestions: data.unresolved_questions,
      blindSpots: data.blind_spots,
      createdAt: new Date(data.created_at),
    });
  }
}
