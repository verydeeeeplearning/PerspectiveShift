import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { FeedbackRepository } from "@/domain/interfaces/feedback-repository";
import type { FeedbackOutput } from "../dtos/feedback-output";
import { DialogueFeedback } from "@/domain/entities/dialogue-feedback";
import {
  SessionNotCompletedError,
  DuplicateFeedbackError,
} from "@/domain/errors/domain-errors";

export interface SubmitFeedbackDeps {
  dialogueRepository: DialogueRepository;
  feedbackRepository: FeedbackRepository;
}

export class SubmitFeedbackUseCase {
  private deps: SubmitFeedbackDeps;

  constructor(deps: SubmitFeedbackDeps) {
    this.deps = deps;
  }

  async execute(
    sessionId: string,
    participantId: string,
    satisfaction: number,
    rematchWillingness: boolean,
    emotionCheckIn: string | null,
    feelHeardScore: number = 3,
    affectiveWarmth: number = 5,
  ): Promise<FeedbackOutput> {
    const session =
      await this.deps.dialogueRepository.findSessionById(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    if (!session.isComplete()) {
      throw new SessionNotCompletedError(sessionId);
    }

    const existing = await this.deps.feedbackRepository.findFeedback(
      sessionId,
      participantId,
    );
    if (existing) {
      throw new DuplicateFeedbackError(sessionId, participantId);
    }

    const feedback = DialogueFeedback.create({
      id: crypto.randomUUID(),
      sessionId,
      participantId,
      satisfaction,
      feelHeardScore,
      affectiveWarmth,
      rematchWillingness,
      emotionCheckIn,
      createdAt: new Date(),
    });

    await this.deps.feedbackRepository.saveFeedback(feedback);

    return {
      id: feedback.id,
      sessionId: feedback.sessionId,
      satisfaction: feedback.satisfaction,
      feelHeardScore: feedback.feelHeardScore,
      affectiveWarmth: feedback.affectiveWarmth,
      rematchWillingness: feedback.rematchWillingness,
      emotionCheckIn: feedback.emotionCheckIn,
      createdAt: feedback.createdAt.toISOString(),
    };
  }
}
