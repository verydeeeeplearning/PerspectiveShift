import { SavedPersona } from "@/domain/entities/saved-persona";
import type { SavedPersonaRepository } from "@/domain/interfaces/saved-persona-repository";

interface SavePersonaInput {
  userId: string;
  personaId: string;
  conversationSummary: string;
  sharedContext?: readonly string[];
  userStanceMemory?: readonly string[];
  savedQuestions?: readonly string[];
}

interface SavePersonaOutput {
  userId: string;
  personaId: string;
  conversationCount: number;
  lastConversationAt: string;
  conversationSummaries: readonly string[];
  sharedContext: readonly string[];
  userStanceMemory: readonly string[];
  savedQuestions: readonly string[];
}

export class SavePersonaUseCase {
  constructor(
    private readonly savedPersonaRepository: SavedPersonaRepository,
  ) {}

  async execute(input: SavePersonaInput): Promise<SavePersonaOutput> {
    const existing = await this.savedPersonaRepository.findByUserAndPersona(
      input.userId,
      input.personaId,
    );
    const base = existing ?? SavedPersona.initialize(input.userId, input.personaId);
    const next = base.appendConversation({
      summary: input.conversationSummary,
      sharedContext: input.sharedContext,
      userStanceMemory: input.userStanceMemory,
      savedQuestions: input.savedQuestions,
    });

    await this.savedPersonaRepository.save(next);

    return {
      userId: next.userId,
      personaId: next.personaId,
      conversationCount: next.conversationCount,
      lastConversationAt: next.lastConversationAt.toISOString(),
      conversationSummaries: next.conversationSummaries,
      sharedContext: next.sharedContext,
      userStanceMemory: next.userStanceMemory,
      savedQuestions: next.savedQuestions,
    };
  }
}
