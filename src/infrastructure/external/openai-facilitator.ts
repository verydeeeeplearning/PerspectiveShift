import OpenAI from "openai";
import type {
  Facilitator,
  ToneCheckResult,
  DriftCheckResult,
  DetectedReceptiveExpression,
} from "@/domain/interfaces/facilitator";
import {
  TONE_CHECK_SYSTEM_PROMPT,
  toneCheckUserPrompt,
  DRIFT_CHECK_SYSTEM_PROMPT,
  driftCheckUserPrompt,
  RECEPTIVENESS_DETECTION_SYSTEM_PROMPT,
  receptivenessDetectionUserPrompt,
} from "./facilitator-prompts";

export class OpenAiFacilitator implements Facilitator {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey, timeout: 20_000 });
  }

  async checkTone(content: string): Promise<ToneCheckResult> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 256,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: TONE_CHECK_SYSTEM_PROMPT },
          { role: "user", content: toneCheckUserPrompt(content) },
        ],
      });

      const raw = response.choices[0]?.message?.content;
      if (!raw) return { passed: true, suggestion: null, alternatives: [] };

      const parsed = JSON.parse(raw);
      return {
        passed: parsed.passed ?? true,
        suggestion: parsed.suggestion ?? null,
        alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives : [],
      };
    } catch (error) {
      console.error("[Facilitator] checkTone error:", error instanceof Error ? error.message : error);
      return { passed: true, suggestion: null, alternatives: [] };
    }
  }

  async checkDrift(
    content: string,
    originalPosition: string,
  ): Promise<DriftCheckResult> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 256,
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
    } catch (error) {
      console.error("[Facilitator] checkDrift error:", error instanceof Error ? error.message : error);
      return { drifted: false, suggestion: null };
    }
  }

  async detectReceptiveExpressions(opponentText: string): Promise<DetectedReceptiveExpression[]> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-5-mini",

        max_completion_tokens: 1024,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: RECEPTIVENESS_DETECTION_SYSTEM_PROMPT },
          { role: "user", content: receptivenessDetectionUserPrompt(opponentText) },
        ],
      });

      const raw = response.choices[0]?.message?.content;
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed.expressions) ? parsed.expressions : [];
    } catch {
      return [];
    }
  }

  async suggestReceptivenessTemplate(text: string): Promise<string[]> {
    const response = await this.client.chat.completions.create({
      model: "gpt-5-mini",

      max_completion_tokens: 1024,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "당신은 건설적 대화를 돕는 퍼실리테이터입니다. 사용자의 메시지를 더 수용적인 톤으로 변환하는 템플릿을 제안합니다. JSON 형식으로 {\"templates\": [\"...\", \"...\"]} 를 반환하세요. 1-3개의 대안 문장을 제안합니다. 인정, 완충어, 질문을 활용하세요.",
        },
        { role: "user", content: text },
      ],
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.templates) ? parsed.templates : [];
  }
}
