import OpenAI from "openai";
import type {
  PersonaDialogueGenerator,
  PersonaMemoryContext,
} from "@/domain/interfaces/persona-dialogue-generator";
import type { PersonaProfile } from "@/domain/entities/persona-profile";
import { personaSystemPrompt, personaUserPrompt } from "./persona-prompts";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class OpenAiPersonaGenerator implements PersonaDialogueGenerator {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey, timeout: 30_000 });
  }

  async generateResponse(
    persona: PersonaProfile,
    conversationHistory: Array<{ role: "user" | "persona"; content: string }>,
    userMessage: string,
    topic: string,
    memoryContext?: PersonaMemoryContext,
  ): Promise<string> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: personaSystemPrompt(persona, topic, memoryContext) },
      { role: "user", content: personaUserPrompt(conversationHistory, userMessage) },
    ];

    // Attempt 1: Full prompt
    const result1 = await this.callApi(messages, 1024);
    if (result1) return result1;

    // Attempt 2: Retry full prompt after delay
    await delay(2000);
    console.warn(`[PersonaGenerator] Attempt 1 failed for ${persona.name}, retrying full prompt...`);
    const result2 = await this.callApi(messages, 1024);
    if (result2) return result2;

    // Attempt 3: Simplified prompt after delay
    await delay(2000);
    console.warn(`[PersonaGenerator] Attempt 2 failed for ${persona.name}, trying simplified prompt...`);
    const result3 = await this.callSimplified(persona, userMessage, topic);
    if (result3) return result3;

    console.error(`[PersonaGenerator] All 3 attempts failed for ${persona.name}`);
    // Topic-aware fallback using persona's experience
    const experience = persona.experienceBank[0] ?? persona.description;
    return `${topic}에 대해 생각해보면, ${experience} 이 부분에서 좀 더 이야기를 나눠보고 싶어요.`;
  }

  private async callApi(
    messages: OpenAI.ChatCompletionMessageParam[],
    maxTokens: number,
  ): Promise<string | null> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: maxTokens,
        messages,
      });

      const content = response.choices[0]?.message?.content;
      if (content && content.trim().length > 0) return content.trim();

      console.error("[PersonaGenerator] Empty content:", JSON.stringify({
        finishReason: response.choices[0]?.finish_reason,
        model: response.model,
        usage: response.usage,
      }));
      return null;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("[PersonaGenerator] API error:", errMsg);
      return null;
    }
  }

  private async callSimplified(
    persona: PersonaProfile,
    userMessage: string,
    topic: string,
  ): Promise<string | null> {
    const experience = persona.experienceBank[0] ?? "";
    return this.callApi(
      [
        {
          role: "system",
          content: [
            `당신은 ${persona.name}입니다.`,
            `${persona.ageGroup}, ${persona.jobCategory}.`,
            `입장: ${persona.stanceLabel}.`,
            persona.description,
            experience ? `경험: ${experience}` : "",
            `한국어 존댓말로 1-3문장 답하세요. 상대방의 말에 직접 반응하되, 원문을 그대로 인용하지 말고 자기 말로 바꿔서 언급하세요.`,
          ].filter(Boolean).join(" "),
        },
        {
          role: "user",
          content: `"${userMessage}" — ${topic} 맥락에서 나의 경험과 입장으로 답하세요.`,
        },
      ],
      512,
    );
  }
}
