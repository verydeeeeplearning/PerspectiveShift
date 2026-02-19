import OpenAI from "openai";
import type { ValueExtractor } from "@/domain/interfaces/value-extractor";

const VALUE_EXTRACTION_PROMPT = `당신은 텍스트에서 핵심 가치 키워드를 추출하는 전문가입니다.

사용자가 제공한 텍스트에서 핵심 가치 키워드를 추출하세요.
반드시 JSON 형식으로 응답하세요: {"keywords": ["키워드1", "키워드2", ...]}
최대 5개의 키워드를 추출하세요.`;

export class OpenAIValueExtractor implements ValueExtractor {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-5-mini") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async extractValuePriority(text: string): Promise<string[]> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: VALUE_EXTRACTION_PROMPT },
          { role: "user", content: text },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return [];

      const parsed = JSON.parse(content);
      return Array.isArray(parsed.keywords) ? parsed.keywords : [];
    } catch {
      return [];
    }
  }
}
