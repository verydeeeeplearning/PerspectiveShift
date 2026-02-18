import OpenAI from "openai";
import type {
  Facilitator,
  ToneCheckResult,
  DriftCheckResult,
} from "@/domain/interfaces/facilitator";
import {
  TONE_CHECK_SYSTEM_PROMPT,
  toneCheckUserPrompt,
  DRIFT_CHECK_SYSTEM_PROMPT,
  driftCheckUserPrompt,
} from "./facilitator-prompts";

export class OpenAiFacilitator implements Facilitator {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async checkTone(content: string): Promise<ToneCheckResult> {
    const response = await this.client.chat.completions.create({
      model: "gpt-5-mini",
      temperature: 0.2,
      max_tokens: 200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: TONE_CHECK_SYSTEM_PROMPT },
        { role: "user", content: toneCheckUserPrompt(content) },
      ],
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return { passed: true, suggestion: null };

    const parsed = JSON.parse(raw);
    return {
      passed: parsed.passed ?? true,
      suggestion: parsed.suggestion ?? null,
    };
  }

  async checkDrift(
    content: string,
    originalPosition: string,
  ): Promise<DriftCheckResult> {
    const response = await this.client.chat.completions.create({
      model: "gpt-5-mini",
      temperature: 0.2,
      max_tokens: 200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: DRIFT_CHECK_SYSTEM_PROMPT },
        {
          role: "user",
          content: driftCheckUserPrompt(content, originalPosition),
        },
      ],
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return { drifted: false, suggestion: null };

    const parsed = JSON.parse(raw);
    return {
      drifted: parsed.drifted ?? false,
      suggestion: parsed.suggestion ?? null,
    };
  }
}
