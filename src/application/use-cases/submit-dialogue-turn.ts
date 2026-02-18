import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { PiiScrubber } from "@/domain/interfaces/pii-scrubber";
import type { Facilitator } from "@/domain/interfaces/facilitator";
import type { TurnSubmissionResult } from "../dtos/dialogue-output";
import { DialogueTurn } from "@/domain/entities/dialogue-turn";

export interface SubmitDialogueTurnDeps {
  dialogueRepository: DialogueRepository;
  piiScrubber: PiiScrubber;
  facilitator: Facilitator;
}

export class SubmitDialogueTurnUseCase {
  private deps: SubmitDialogueTurnDeps;

  constructor(deps: SubmitDialogueTurnDeps) {
    this.deps = deps;
  }

  async execute(
    sessionId: string,
    participantId: string,
    content: string,
  ): Promise<TurnSubmissionResult> {
    const session =
      await this.deps.dialogueRepository.findSessionById(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const scrubbed = this.deps.piiScrubber.scrub(content);

    const toneCheck = await this.deps.facilitator.checkTone(
      scrubbed.scrubbed,
    );

    let driftCheck = { drifted: false, suggestion: null as string | null };
    const positionTurns = session.turnsForStep("POSITION");
    const myPosition = positionTurns.find(
      (t) => t.participantId === participantId,
    );
    if (myPosition) {
      driftCheck = await this.deps.facilitator.checkDrift(
        scrubbed.scrubbed,
        myPosition.content,
      );
    }

    const stepBefore = session.currentStep;
    const turn = DialogueTurn.create({
      id: crypto.randomUUID(),
      sessionId,
      step: session.currentStep,
      participantId,
      content: scrubbed.scrubbed,
      createdAt: new Date(),
    });

    session.submitTurn(turn);
    await this.deps.dialogueRepository.saveTurn(turn);
    await this.deps.dialogueRepository.updateSession(session);

    return {
      turnId: turn.id,
      toneCheck: {
        passed: toneCheck.passed,
        suggestion: toneCheck.suggestion,
      },
      driftCheck: {
        drifted: driftCheck.drifted,
        suggestion: driftCheck.suggestion,
      },
      advanced: session.currentStep !== stepBefore,
      newStep: session.currentStep,
      sessionStatus: session.status,
    };
  }
}
