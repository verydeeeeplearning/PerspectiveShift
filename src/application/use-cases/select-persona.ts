import type { PersonaRepository } from "@/domain/interfaces/persona-repository";

export interface SelectPersonaInput {
  personaId: string;
}

export interface SelectPersonaOutput {
  id: string;
  name: string;
  ageGroup: string;
  jobCategory: string;
  stanceLabel: string;
  description: string;
  conversationStyle: string;
}

export class SelectPersonaUseCase {
  constructor(private personaRepository: PersonaRepository) {}

  async execute(input: SelectPersonaInput): Promise<SelectPersonaOutput> {
    const persona = await this.personaRepository.findById(input.personaId);
    if (!persona) {
      throw new Error(`Persona not found: ${input.personaId}`);
    }
    return {
      id: persona.id,
      name: persona.name,
      ageGroup: persona.ageGroup,
      jobCategory: persona.jobCategory,
      stanceLabel: persona.stanceLabel,
      description: persona.description,
      conversationStyle: persona.conversationStyle,
    };
  }
}
