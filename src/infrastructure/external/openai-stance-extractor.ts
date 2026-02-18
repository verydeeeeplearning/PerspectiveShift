import OpenAI from "openai";
import type {
  LlmStanceExtractor,
  LlmExtractionInput,
  LlmExtractionResult,
} from "@/domain/interfaces/llm-stance-extractor";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";
import {
  STANCE_EXTRACTION_SYSTEM_PROMPT,
  buildUserPrompt,
} from "./stance-extraction-prompt";

interface RawExtractionResponse {
  axes: Partial<Record<StanceDimension, number | null>>;
  reasoning: string;
  readiness: number;
}

export class OpenAiStanceExtractor implements LlmStanceExtractor {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-5-mini") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async extract(
    inputs: LlmExtractionInput[],
  ): Promise<LlmExtractionResult> {
    const userPrompt = buildUserPrompt(
      inputs.map((i) => ({
        questionId: i.questionId,
        text: i.scrubbedText,
      })),
    );

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: STANCE_EXTRACTION_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const parsed: RawExtractionResponse = JSON.parse(content);
    return this.normalize(parsed);
  }

  private normalize(
    raw: RawExtractionResponse,
  ): LlmExtractionResult {
    const axes: Partial<Record<StanceDimension, number>> = {};

    if (raw.axes) {
      for (const [key, value] of Object.entries(raw.axes)) {
        if (
          value !== null &&
          typeof value === "number" &&
          value >= -1 &&
          value <= 1
        ) {
          axes[key as StanceDimension] = value;
        }
      }
    }

    return {
      axes,
      reasoning: raw.reasoning || "",
      readiness: Math.max(0, Math.min(1, raw.readiness ?? 0.5)),
    };
  }
}
