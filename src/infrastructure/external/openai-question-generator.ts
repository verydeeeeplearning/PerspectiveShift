import OpenAI from "openai";
import type {
  QuestionGenerator,
  QuestionGenerationContext,
  GeneratedQuestionBatch,
  GeneratedQuestionData,
} from "@/domain/interfaces/question-generator";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";
import { ALL_DIMENSIONS } from "@/domain/value-objects/stance-dimension";
import {
  QUESTION_GENERATION_SYSTEM_PROMPT,
  buildQuestionGenerationUserPrompt,
} from "./question-generation-prompts";

const VALID_TYPES = new Set(["OX", "RUBRIC"]);
const VALID_DIMENSIONS = new Set(ALL_DIMENSIONS);

interface RawQuestionResponse {
  questions: Array<{
    text: string;
    type: string;
    dimension: string;
    polarity: number;
  }>;
}

export class OpenAiQuestionGenerator implements QuestionGenerator {
  private client: OpenAI;
  private model: string;

  constructor(
    apiKey: string,
    model: string = process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  ) {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generate(
    context: QuestionGenerationContext,
  ): Promise<GeneratedQuestionBatch> {
    const userPrompt = buildQuestionGenerationUserPrompt(
      context.previousAnswers,
      context.targetDimensions,
      context.batchSize,
      context.excludeQuestionIds,
    );

    try {
      return await this.callOpenAi(userPrompt, context);
    } catch (error) {
      console.error("[QuestionGenerator] First attempt failed, retrying:", error);
      try {
        return await this.callOpenAi(userPrompt, context);
      } catch (retryError) {
        console.error("[QuestionGenerator] Retry also failed:", retryError);
        throw retryError;
      }
    }
  }

  private async callOpenAi(
    userPrompt: string,
    context: QuestionGenerationContext,
  ): Promise<GeneratedQuestionBatch> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: QUESTION_GENERATION_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const parsed: RawQuestionResponse = JSON.parse(content);
    return this.normalize(parsed, context);
  }

  private normalize(
    raw: RawQuestionResponse,
    context: QuestionGenerationContext,
  ): GeneratedQuestionBatch {
    if (!raw.questions || !Array.isArray(raw.questions)) {
      throw new Error("Invalid response structure: missing questions array");
    }

    const questions: GeneratedQuestionData[] = raw.questions
      .filter((q) => {
        if (!q.text || typeof q.text !== "string" || q.text.trim() === "") return false;
        if (!VALID_TYPES.has(q.type)) return false;
        if (!VALID_DIMENSIONS.has(q.dimension as StanceDimension)) return false;
        return true;
      })
      .slice(0, context.batchSize)
      .map((q) => ({
        text: q.text.trim(),
        type: q.type as "OX" | "RUBRIC",
        dimension: q.dimension as StanceDimension,
        polarity: q.polarity === -1 ? -1 : 1,
      }));

    return {
      questions,
      batchIndex: context.batchIndex,
    };
  }
}
