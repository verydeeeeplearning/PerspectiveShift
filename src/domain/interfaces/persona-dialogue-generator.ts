import type { PersonaProfile } from "../entities/persona-profile";

export interface PersonaDialogueGenerator {
  generateResponse(
    persona: PersonaProfile,
    conversationHistory: Array<{ role: "user" | "persona"; content: string }>,
    userMessage: string,
    topic: string,
  ): Promise<string>;
}
