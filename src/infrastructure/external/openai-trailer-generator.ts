import OpenAI from "openai";
import type { TrailerGenerator } from "@/domain/interfaces/trailer-generator";
import type { StanceVector } from "@/domain/entities/stance-vector";
import { ConversationTrailer } from "@/domain/value-objects/conversation-trailer";
import { TRAILER_SYSTEM_PROMPT, trailerUserPrompt } from "./trailer-prompts";

export class OpenAiTrailerGenerator implements TrailerGenerator {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generate(
    opponentStance: StanceVector,
    myStance: StanceVector,
    topic: string,
  ): Promise<ConversationTrailer> {
    const response = await this.client.chat.completions.create({
      model: "gpt-5-mini",
      temperature: 0.6,
      max_tokens: 150,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: TRAILER_SYSTEM_PROMPT },
        {
          role: "user",
          content: trailerUserPrompt(
            myStance.toValues(),
            opponentStance.toValues(),
            topic,
          ),
        },
      ],
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      return ConversationTrailer.create("서로 다른 시각에서 출발해요.");
    }

    const parsed = JSON.parse(raw);
    const text = typeof parsed.text === "string" ? parsed.text : "서로 다른 시각에서 출발해요.";

    return ConversationTrailer.create(text.slice(0, 80));
  }
}
