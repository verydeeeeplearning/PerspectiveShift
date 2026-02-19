import type { ValueExtractor } from "@/domain/interfaces/value-extractor";

export class FallbackValueExtractor implements ValueExtractor {
  async extractValuePriority(_text: string): Promise<string[]> {
    return [];
  }
}
