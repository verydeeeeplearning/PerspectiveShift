import type { StanceDimension } from "../value-objects/stance-dimension";

export interface LlmExtractionInput {
  questionId: number;
  scrubbedText: string;
}

export interface LlmExtractionResult {
  axes: Partial<Record<StanceDimension, number>>;
  reasoning: string;
  readiness: number;
}

export interface LlmStanceExtractor {
  extract(inputs: LlmExtractionInput[]): Promise<LlmExtractionResult>;
}
