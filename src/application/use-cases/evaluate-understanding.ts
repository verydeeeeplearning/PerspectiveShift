import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { FeedbackRepository } from "@/domain/interfaces/feedback-repository";
import type { PiiScrubber } from "@/domain/interfaces/pii-scrubber";
import type { SummaryGenerator } from "@/domain/interfaces/summary-generator";
import type { UnderstandingScoreOutput } from "../dtos/feedback-output";
import { UnderstandingScore } from "@/domain/entities/understanding-score";
import { SessionNotCompletedError } from "@/domain/errors/domain-errors";

export interface EvaluateUnderstandingDeps {
  dialogueRepository: DialogueRepository;
  feedbackRepository: FeedbackRepository;
  piiScrubber: PiiScrubber;
  summaryGenerator: SummaryGenerator;
}

export class EvaluateUnderstandingUseCase {
  private deps: EvaluateUnderstandingDeps;

  constructor(deps: EvaluateUnderstandingDeps) {
    this.deps = deps;
  }

  async execute(
    sessionId: string,
    participantId: string,
  ): Promise<UnderstandingScoreOutput> {
    const session =
      await this.deps.dialogueRepository.findSessionById(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    if (!session.isComplete()) {
      throw new SessionNotCompletedError(sessionId);
    }

    const reflections = session.turnsForStep("REFLECTION");
    const myReflection = reflections.find(
      (t) => t.participantId === participantId,
    );
    if (!myReflection) {
      throw new Error("Reflection not found for participant");
    }

    const opponentId =
      participantId === session.participantA
        ? session.participantB
        : session.participantA;
    const opponentTurns = session.turns.filter(
      (t) => t.participantId === opponentId,
    );

    const scrubbedReflection = this.deps.piiScrubber.scrub(
      myReflection.content,
    );
    const scrubbedOpponentTurns = opponentTurns.map((t) => ({
      ...t,
      content: this.deps.piiScrubber.scrub(t.content).scrubbed,
    }));

    const result =
      await this.deps.summaryGenerator.evaluateUnderstanding(
        scrubbedReflection.scrubbed,
        scrubbedOpponentTurns,
      );

    const score = UnderstandingScore.create({
      id: crypto.randomUUID(),
      sessionId,
      participantId,
      score: result.score,
      evaluation: result.evaluation,
      createdAt: new Date(),
    });

    await this.deps.feedbackRepository.saveUnderstandingScore(score);

    return {
      id: score.id,
      sessionId: score.sessionId,
      participantId: score.participantId,
      score: score.score,
      evaluation: score.evaluation,
      createdAt: score.createdAt.toISOString(),
    };
  }
}
