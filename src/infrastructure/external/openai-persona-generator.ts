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

      const choice = response.choices[0];
      const content = choice?.message?.content;

      if (content) {
        return content.trim();
      }

      // Log why content is empty for debugging
      console.error("[PersonaGenerator] Empty content from OpenAI:", {
        finishReason: choice?.finish_reason,
        model: response.model,
        personaName: persona.name,
      });

      // Retry with a simplified, direct prompt
      return this.retryWithSimplifiedPrompt(persona, userMessage, topic);
    } catch (error) {
      console.error("[PersonaGenerator] OpenAI API error:", error);
      // Retry once with simplified prompt before giving up
      return this.retryWithSimplifiedPrompt(persona, userMessage, topic);
    }
  }

  private async retryWithSimplifiedPrompt(
    persona: PersonaProfile,
    userMessage: string,
    topic: string,
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 512,
        messages: [
          {
            role: "system",
            content: [
              `당신은 "${persona.name}"입니다.`,
              `프로필: ${persona.ageGroup}, ${persona.jobCategory}.`,
              `입장: ${persona.stanceLabel}.`,
              persona.description,
              `한국어 구어체(존댓말)로 1-3문장 답변하세요.`,
              `상대방의 말에 직접적으로 반응하세요.`,
            ].join(" "),
          },
          {
            role: "user",
            content: `"${userMessage}" — 이 발언에 대해 ${topic} 맥락에서 자연스럽게 응답하세요.`,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (content) return content.trim();
    } catch (retryError) {
      console.error("[PersonaGenerator] Retry also failed:", retryError);
    }

    // Last resort: return a generic but engaging response
    // This should rarely happen — means both API calls failed
    return `그 부분에 대해 저도 생각이 있는데요, 좀 더 자세히 말씀해주시겠어요?`;
  }
}
