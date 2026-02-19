import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { FeedbackRepository } from "@/domain/interfaces/feedback-repository";
import type { PiiScrubber } from "@/domain/interfaces/pii-scrubber";
import type { SummaryGenerator } from "@/domain/interfaces/summary-generator";
import type { SummaryCardOutput } from "../dtos/feedback-output";
import { SummaryCard } from "@/domain/entities/summary-card";
import { SessionNotCompletedError } from "@/domain/errors/domain-errors";
import { DialogueTurn } from "@/domain/entities/dialogue-turn";

export interface GenerateSummaryCardDeps {
  dialogueRepository: DialogueRepository;
  feedbackRepository: FeedbackRepository;
  piiScrubber: PiiScrubber;
  summaryGenerator: SummaryGenerator;
}

export class GenerateSummaryCardUseCase {
  private deps: GenerateSummaryCardDeps;

  constructor(deps: GenerateSummaryCardDeps) {
    this.deps = deps;
  }

  async execute(sessionId: string): Promise<SummaryCardOutput> {
    const existing =
      await this.deps.feedbackRepository.findSummaryCard(sessionId);
    if (existing) {
      return {
        id: existing.id,
        sessionId: existing.sessionId,
        keyArguments: existing.keyArguments,
        commonGround: existing.commonGround,
        unresolvedQuestions: existing.unresolvedQuestions,
        blindSpots: existing.blindSpots,
        createdAt: existing.createdAt.toISOString(),
      };
    }

    const session =
      await this.deps.dialogueRepository.findSessionById(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    if (!session.isComplete()) {
      throw new SessionNotCompletedError(sessionId);
    }

    const scrubbedTurns = session.turns.map((t) => {
      const scrubbed = this.deps.piiScrubber.scrub(t.content);
      return DialogueTurn.create({
        id: t.id,
        sessionId: t.sessionId,
        step: t.step,
        participantId: t.participantId,
        content: scrubbed.scrubbed,
        createdAt: t.createdAt,
      });
    });

    const result = await this.deps.summaryGenerator.generateSummary(
      scrubbedTurns,
      session.participantA,
      session.participantB,
    );

    const card = SummaryCard.create({
      id: crypto.randomUUID(),
      sessionId,
      keyArguments: result.keyArguments,
      commonGround: result.commonGround,
      unresolvedQuestions: result.unresolvedQuestions,
      blindSpots: result.blindSpots,
      createdAt: new Date(),
    });

    await this.deps.feedbackRepository.saveSummaryCard(card);

    return {
      id: card.id,
      sessionId: card.sessionId,
      keyArguments: card.keyArguments,
      commonGround: card.commonGround,
      unresolvedQuestions: card.unresolvedQuestions,
      blindSpots: card.blindSpots,
      createdAt: card.createdAt.toISOString(),
    };
  }
}
