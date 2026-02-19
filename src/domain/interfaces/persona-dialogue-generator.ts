import type { PersonaProfile } from "../entities/persona-profile";

export interface PersonaMemoryContext {
  conversationSummaries: string[];
  sharedContext: string[];
  userStanceMemory: string[];
  savedQuestions: string[];
}

export interface PersonaDialogueGenerator {
  generateResponse(
    persona: PersonaProfile,
    conversationHistory: Array<{ role: "user" | "persona"; content: string }>,
    userMessage: string,
    topic: string,
    memoryContext?: PersonaMemoryContext,
  ): Promise<string>;
}
