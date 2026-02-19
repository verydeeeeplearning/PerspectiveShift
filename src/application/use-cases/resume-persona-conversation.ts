import type { SavedPersonaRepository } from "@/domain/interfaces/saved-persona-repository";
import type { PersonaMemoryContext } from "@/domain/interfaces/persona-dialogue-generator";

interface ResumePersonaConversationInput {
  userId: string;
  personaId: string;
}

interface ResumePersonaConversationOutput {
  memoryContext: PersonaMemoryContext;
  conversationCount: number;
  lastConversationAt: string | null;
}

export class ResumePersonaConversationUseCase {
  constructor(
    private readonly savedPersonaRepository: SavedPersonaRepository,
  ) {}

  async execute(
    input: ResumePersonaConversationInput,
  ): Promise<ResumePersonaConversationOutput> {
    const saved = await this.savedPersonaRepository.findByUserAndPersona(
      input.userId,
      input.personaId,
    );

    if (!saved) {
      return {
        memoryContext: {
          conversationSummaries: [],
          sharedContext: [],
          userStanceMemory: [],
          savedQuestions: [],
        },
        conversationCount: 0,
        lastConversationAt: null,
      };
    }

    return {
      memoryContext: {
        conversationSummaries: [...saved.conversationSummaries],
        sharedContext: [...saved.sharedContext],
        userStanceMemory: [...saved.userStanceMemory],
        savedQuestions: [...saved.savedQuestions],
      },
      conversationCount: saved.conversationCount,
      lastConversationAt: saved.lastConversationAt.toISOString(),
    };
  }
}
