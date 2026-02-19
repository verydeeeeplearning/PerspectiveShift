import type {
  PersonaDialogueGenerator,
  PersonaMemoryContext,
} from "@/domain/interfaces/persona-dialogue-generator";
import type { PersonaProfile } from "@/domain/entities/persona-profile";

const STYLE_TEMPLATES: Record<string, (persona: PersonaProfile, topic: string) => string> = {
  logical: (persona, topic) =>
    `${topic}에 대해 데이터를 기반으로 생각해보면, ${persona.experienceBank[0] ?? ""} 제 경험상 객관적 근거가 중요합니다.`,
  emotional: (persona, topic) =>
    `${topic} 이야기를 들으니, 마음이 움직이네요. ${persona.experienceBank[0] ?? ""} 사람들의 감정을 먼저 생각하게 됩니다.`,
  humorous: (persona, topic) =>
    `${topic}이라... 재미있는 주제네요! ${persona.experienceBank[0] ?? ""} 가볍게 이야기해볼까요?`,
  careful: (persona, topic) =>
    `${topic}에 대해서는 좀 더 신중하게 생각해볼 필요가 있을 것 같아요. ${persona.experienceBank[0] ?? ""} 여러 관점을 고려해보고 싶습니다.`,
};

/**
 * Stub implementation of PersonaDialogueGenerator.
 * Returns templated responses based on the persona's conversation style
 * without making actual LLM API calls.
 * Replace with real LLM integration (e.g., OpenAI) in production.
 */
export class PersonaLlmAdapter implements PersonaDialogueGenerator {
  async generateResponse(
    persona: PersonaProfile,
    _conversationHistory: Array<{ role: "user" | "persona"; content: string }>,
    _userMessage: string,
    topic: string,
    _memoryContext?: PersonaMemoryContext,
  ): Promise<string> {
    const template = STYLE_TEMPLATES[persona.conversationStyle];
    if (!template) {
      return `${topic}에 대해 이야기해볼까요? ${persona.description}`;
    }
    return template(persona, topic);
  }
}
