import OpenAI from "openai";
import type {
  PersonaDialogueGenerator,
  PersonaMemoryContext,
} from "@/domain/interfaces/persona-dialogue-generator";
import type { PersonaProfile } from "@/domain/entities/persona-profile";
import { personaSystemPrompt, personaUserPrompt } from "./persona-prompts";

export class OpenAiPersonaGenerator implements PersonaDialogueGenerator {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateResponse(
    persona: PersonaProfile,
    conversationHistory: Array<{ role: "user" | "persona"; content: string }>,
    userMessage: string,
    topic: string,
    memoryContext?: PersonaMemoryContext,
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: "gpt-5-mini",
      temperature: 0.7,
      max_tokens: 300,
      messages: [
        { role: "system", content: personaSystemPrompt(persona, topic, memoryContext) },
        { role: "user", content: personaUserPrompt(conversationHistory, userMessage) },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return `${topic}에 대해 더 이야기해볼까요?`;
    }

    return content.trim();
  }
}
