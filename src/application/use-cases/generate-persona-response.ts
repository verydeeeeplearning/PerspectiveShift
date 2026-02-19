import type { PersonaRepository } from "@/domain/interfaces/persona-repository";
import type { PersonaDialogueGenerator } from "@/domain/interfaces/persona-dialogue-generator";
import { PersonaResponseDelay } from "@/domain/value-objects/persona-response-delay";

export interface GeneratePersonaResponseInput {
  personaId: string;
  userMessage: string;
  topic: string;
  conversationHistory: Array<{ role: "user" | "persona"; content: string }>;
}

export interface GeneratePersonaResponseOutput {
  response: string;
  delayMs: number;
}

export interface GeneratePersonaResponseDeps {
  personaRepository: PersonaRepository;
  personaDialogueGenerator: PersonaDialogueGenerator;
}

export class GeneratePersonaResponseUseCase {
  constructor(private deps: GeneratePersonaResponseDeps) {}

  async execute(input: GeneratePersonaResponseInput): Promise<GeneratePersonaResponseOutput> {
    const persona = await this.deps.personaRepository.findById(input.personaId);
    if (!persona) {
      throw new Error(`Persona not found: ${input.personaId}`);
    }

    const response = await this.deps.personaDialogueGenerator.generateResponse(
      persona,
      input.conversationHistory,
      input.userMessage,
      input.topic,
    );

    const delay = PersonaResponseDelay.calculate(response.length);

    return {
      response,
      delayMs: delay.delayMs,
    };
  }
}
