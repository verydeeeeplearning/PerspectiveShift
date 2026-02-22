import { DialogueSession } from "@/domain/entities/dialogue-session";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { PersonaRepository } from "@/domain/interfaces/persona-repository";

export interface CreateAgentDialogueSessionInput {
  participantSessionId: string;
  personaId: string;
  topic?: string;
}

export interface CreateAgentDialogueSessionOutput {
  id: string;
  topic: string;
  currentStep: "POSITION";
  status: "ACTIVE";
  personaId: string;
}

export interface CreateAgentDialogueSessionDeps {
  personaRepository: PersonaRepository;
  dialogueRepository: DialogueRepository;
}

export class CreateAgentDialogueSessionUseCase {
  constructor(private readonly deps: CreateAgentDialogueSessionDeps) {}

  async execute(
    input: CreateAgentDialogueSessionInput,
  ): Promise<CreateAgentDialogueSessionOutput> {
    const persona = await this.deps.personaRepository.findById(input.personaId);
    if (!persona) {
      throw new Error(`Persona not found: ${input.personaId}`);
    }

    const now = new Date();
    const topic = input.topic?.trim() || "자유 주제";
    const session = DialogueSession.create({
      id: crypto.randomUUID(),
      participantA: input.participantSessionId,
      participantB: `agent:${persona.id}`,
      topic,
      currentStep: "POSITION",
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    });

    await this.deps.dialogueRepository.saveSession(session);

    return {
      id: session.id,
      topic,
      currentStep: "POSITION",
      status: "ACTIVE",
      personaId: persona.id,
    };
  }
}
