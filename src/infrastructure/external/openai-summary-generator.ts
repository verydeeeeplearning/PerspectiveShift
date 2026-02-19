import OpenAI from "openai";
import type {
  SummaryGenerator,
  SummaryResult,
  UnderstandingResult,
} from "@/domain/interfaces/summary-generator";
import type { DialogueTurn } from "@/domain/entities/dialogue-turn";
import {
  SUMMARY_SYSTEM_PROMPT,
  summaryUserPrompt,
  UNDERSTANDING_SYSTEM_PROMPT,
  understandingUserPrompt,
} from "./summary-prompts";

export class OpenAiSummaryGenerator implements SummaryGenerator {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateSummary(
    turns: DialogueTurn[],
    participantA: string,
    participantB: string,
  ): Promise<SummaryResult> {
    const turnData = turns.map((t) => ({
      step: t.step,
      participantId: t.participantId,
      content: t.content,
    }));

    const response = await this.client.chat.completions.create({
      model: "gpt-5-mini",
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SUMMARY_SYSTEM_PROMPT },
        {
          role: "user",
          content: summaryUserPrompt(turnData, participantA, participantB),
        },
      ],
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      return {
        keyArguments: { participantA: [], participantB: [] },
        commonGround: [],
        unresolvedQuestions: [],
        blindSpots: [],
      };
    }

    const parsed = JSON.parse(raw);
    return {
      keyArguments: {
        participantA: parsed.keyArguments?.participantA ?? [],
        participantB: parsed.keyArguments?.participantB ?? [],
      },
      commonGround: parsed.commonGround ?? [],
      unresolvedQuestions: parsed.unresolvedQuestions ?? [],
      blindSpots: parsed.blindSpots ?? [],
    };
  }

  async evaluateUnderstanding(
    reflectionContent: string,
    opponentTurns: DialogueTurn[],
  ): Promise<UnderstandingResult> {
    const turnData = opponentTurns.map((t) => ({
      step: t.step,
      content: t.content,
    }));

    const response = await this.client.chat.completions.create({
      model: "gpt-5-mini",
      temperature: 0.2,
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: UNDERSTANDING_SYSTEM_PROMPT },
        {
          role: "user",
          content: understandingUserPrompt(reflectionContent, turnData),
        },
      ],
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return { score: 0.5, evaluation: "평가 불가" };

    const parsed = JSON.parse(raw);
    return {
      score: Math.min(1, Math.max(0, parsed.score ?? 0.5)),
      evaluation: parsed.evaluation ?? "평가 없음",
    };
  }
}
