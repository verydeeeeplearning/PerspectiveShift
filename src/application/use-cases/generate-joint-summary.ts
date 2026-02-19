import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { SummaryGenerator } from "@/domain/interfaces/summary-generator";
import { JointSummary } from "@/domain/entities/joint-summary";
import type { JointSummaryOutput } from "../dtos/joint-summary-output";

export interface GenerateJointSummaryDeps {
  dialogueRepository: DialogueRepository;
  summaryGenerator: SummaryGenerator;
}

export class GenerateJointSummaryUseCase {
  constructor(private readonly deps: GenerateJointSummaryDeps) {}

  async execute(sessionId: string): Promise<JointSummaryOutput> {
    const session = await this.deps.dialogueRepository.findSessionById(sessionId);
    if (!session) {
      throw new Error(`Dialogue session ${sessionId} not found`);
    }

    const turns = [...session.turns];

    const summary = await this.deps.summaryGenerator.generateSummary(
      turns,
      session.participantA,
      session.participantB,
    );

    const jointSummary = JointSummary.create({
      sessionId,
      agreedPoints: summary.commonGround,
      disagreedPoints: [],
      sharedQuestions: summary.unresolvedQuestions,
      llmGenerated: true,
    });

    return {
      sessionId: jointSummary.sessionId,
      agreedPoints: [...jointSummary.agreedPoints],
      disagreedPoints: [...jointSummary.disagreedPoints],
      sharedQuestions: [...jointSummary.sharedQuestions],
      llmGenerated: jointSummary.llmGenerated,
    };
  }
}
