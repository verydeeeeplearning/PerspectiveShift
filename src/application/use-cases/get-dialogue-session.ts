import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { DialogueSessionOutput } from "../dtos/dialogue-output";

export interface GetDialogueSessionDeps {
  dialogueRepository: DialogueRepository;
}

export class GetDialogueSessionUseCase {
  private deps: GetDialogueSessionDeps;

  constructor(deps: GetDialogueSessionDeps) {
    this.deps = deps;
  }

  async execute(
    sessionId: string,
    participantId: string,
  ): Promise<DialogueSessionOutput | null> {
    const session =
      await this.deps.dialogueRepository.findSessionById(sessionId);
    if (!session) return null;

    return {
      id: session.id,
      topic: session.topic || "자유 주제",
      currentStep: session.currentStep,
      status: session.status,
      mySubmitted: session.hasSubmitted(
        participantId,
        session.currentStep,
      ),
      opponentSubmitted:
        session.turnsForStep(session.currentStep).length > 0 &&
        !session.hasSubmitted(participantId, session.currentStep)
          ? true
          : session.turnsForStep(session.currentStep).length === 2,
      turns: session.turns.map((t) => ({
        id: t.id,
        step: t.step,
        participantId: t.participantId,
        content: t.content,
        isMine: t.participantId === participantId,
        createdAt: t.createdAt.toISOString(),
      })),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  }

  async listByParticipant(
    participantId: string,
  ): Promise<DialogueSessionOutput[]> {
    const sessions =
      await this.deps.dialogueRepository.findSessionsByParticipant(
        participantId,
      );

    return sessions.map((session) => ({
      id: session.id,
      topic: session.topic || "자유 주제",
      currentStep: session.currentStep,
      status: session.status,
      mySubmitted: session.hasSubmitted(
        participantId,
        session.currentStep,
      ),
      opponentSubmitted:
        session.turnsForStep(session.currentStep).length === 2,
      turns: [],
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    }));
  }
}
