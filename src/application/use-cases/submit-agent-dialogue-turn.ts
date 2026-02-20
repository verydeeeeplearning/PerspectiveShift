import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { PiiScrubber } from "@/domain/interfaces/pii-scrubber";
import type { Facilitator } from "@/domain/interfaces/facilitator";
import type { PersonaRepository } from "@/domain/interfaces/persona-repository";
import type { PersonaDialogueGenerator } from "@/domain/interfaces/persona-dialogue-generator";
import type { AgentTurnSubmissionResult } from "../dtos/dialogue-output";
import { DialogueTurn } from "@/domain/entities/dialogue-turn";
import { PersonaResponseDelay } from "@/domain/value-objects/persona-response-delay";

const DEFAULT_TOPIC = "사회 정책과 가치관에 대한 구조화된 대화";

export interface SubmitAgentDialogueTurnDeps {
  dialogueRepository: DialogueRepository;
  piiScrubber: PiiScrubber;
  facilitator: Facilitator;
  personaRepository: PersonaRepository;
  personaDialogueGenerator: PersonaDialogueGenerator;
}

export class SubmitAgentDialogueTurnUseCase {
  constructor(private readonly deps: SubmitAgentDialogueTurnDeps) {}

  async execute(
    sessionId: string,
    participantId: string,
    content: string,
  ): Promise<AgentTurnSubmissionResult> {
    const session =
      await this.deps.dialogueRepository.findSessionById(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // --- 1. Submit user turn (PII scrub + tone/drift check) ---
    const scrubbed = this.deps.piiScrubber.scrub(content);

    // Parallelize tone check and drift check for faster response
    const positionTurns = session.turnsForStep("POSITION");
    const myPosition = positionTurns.find(
      (t) => t.participantId === participantId,
    );

    const [toneCheck, driftCheck] = await Promise.all([
      this.deps.facilitator.checkTone(scrubbed.scrubbed),
      myPosition
        ? this.deps.facilitator.checkDrift(scrubbed.scrubbed, myPosition.content)
        : Promise.resolve({ drifted: false, suggestion: null as string | null }),
    ]);

    const stepBefore = session.currentStep;
    const userTurn = DialogueTurn.create({
      id: crypto.randomUUID(),
      sessionId,
      step: session.currentStep,
      participantId,
      content: scrubbed.scrubbed,
      createdAt: new Date(),
    });

    session.submitTurn(userTurn);
    await this.deps.dialogueRepository.saveTurn(userTurn);
    await this.deps.dialogueRepository.updateSession(session);

    // --- 2. Check if agent session ---
    const isAgentSession = session.participantB.startsWith("agent:");
    if (!isAgentSession) {
      return {
        turnId: userTurn.id,
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
        agentResponse: null,
      };
    }

    // --- 3. Generate agent response ---
    const personaId = session.participantB.replace("agent:", "");
    const persona = await this.deps.personaRepository.findById(personaId);
    if (!persona) {
      throw new Error(`Persona not found: ${personaId}`);
    }

    const history = session.turns
      .filter((t) => t.step === session.currentStep || t.step === stepBefore)
      .map((t) => ({
        role: (t.participantId === participantId ? "user" : "persona") as
          | "user"
          | "persona",
        content: t.content,
      }));

    const agentContent =
      await this.deps.personaDialogueGenerator.generateResponse(
        persona,
        history,
        scrubbed.scrubbed,
        DEFAULT_TOPIC,
      );

    // --- 4. Submit agent turn ---
    const agentTurn = DialogueTurn.create({
      id: crypto.randomUUID(),
      sessionId,
      step: session.currentStep,
      participantId: session.participantB,
      content: agentContent,
      createdAt: new Date(),
    });

    session.submitTurn(agentTurn);
    await this.deps.dialogueRepository.saveTurn(agentTurn);
    await this.deps.dialogueRepository.updateSession(session);

    // --- 5. Auto-complete JOINT_SUMMARY for agent sessions ---
    if (session.currentStep === "JOINT_SUMMARY") {
      const now = new Date();
      const userSummaryTurn = DialogueTurn.create({
        id: crypto.randomUUID(),
        sessionId,
        step: "JOINT_SUMMARY",
        participantId,
        content: "대화 요약이 자동으로 생성되었습니다.",
        createdAt: now,
      });
      session.submitTurn(userSummaryTurn);
      await this.deps.dialogueRepository.saveTurn(userSummaryTurn);

      const agentSummaryTurn = DialogueTurn.create({
        id: crypto.randomUUID(),
        sessionId,
        step: "JOINT_SUMMARY",
        participantId: session.participantB,
        content: "대화 요약이 자동으로 생성되었습니다.",
        createdAt: now,
      });
      session.submitTurn(agentSummaryTurn);
      await this.deps.dialogueRepository.saveTurn(agentSummaryTurn);
      await this.deps.dialogueRepository.updateSession(session);
    }

    const delay = PersonaResponseDelay.calculate(agentContent.length);

    return {
      turnId: userTurn.id,
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
      agentResponse: {
        content: agentContent,
        delayMs: delay.delayMs,
        personaName: persona.name,
      },
    };
  }
}
