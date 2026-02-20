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
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 1024,
        messages: [
          { role: "system", content: personaSystemPrompt(persona, topic, memoryContext) },
          { role: "user", content: personaUserPrompt(conversationHistory, userMessage) },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (content) return content.trim();

      console.error("[PersonaGenerator] Empty content:", {
        finishReason: response.choices[0]?.finish_reason,
        model: response.model,
        persona: persona.name,
      });

      return this.retryWithSimplifiedPrompt(persona, userMessage, topic);
    } catch (error) {
      console.error("[PersonaGenerator] API error:", error);
      return this.retryWithSimplifiedPrompt(persona, userMessage, topic);
    }
  }

  private async retryWithSimplifiedPrompt(
    persona: PersonaProfile,
    userMessage: string,
    topic: string,
  ): Promise<string> {
    try {
      const experience = persona.experienceBank[0] ?? "";
      const response = await this.client.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 512,
        messages: [
          {
            role: "system",
            content: [
              `당신은 ${persona.name}입니다.`,
              `${persona.ageGroup}, ${persona.jobCategory}.`,
              `입장: ${persona.stanceLabel}.`,
              persona.description,
              experience ? `경험: ${experience}` : "",
              `한국어 존댓말로 1-3문장 답하세요. 상대방의 말에 직접 반응하세요.`,
            ].filter(Boolean).join(" "),
          },
          {
            role: "user",
            content: `"${userMessage}" — ${topic} 맥락에서 나의 경험과 입장으로 답하세요.`,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (content) return content.trim();
    } catch (retryError) {
      console.error("[PersonaGenerator] Retry failed:", retryError);
    }

    return `그 부분에 대해 저도 생각이 있는데요, 좀 더 자세히 말씀해주시겠어요?`;
  }
}
