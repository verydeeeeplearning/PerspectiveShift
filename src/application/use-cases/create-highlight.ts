import { Highlight } from "@/domain/entities/highlight";

export interface CreateHighlightInput {
  turnId: string;
  startOffset: number;
  endOffset: number;
  highlightedText: string;
}

export interface HighlightResult {
  turnId: string;
  startOffset: number;
  endOffset: number;
  highlightedText: string;
  autoQuote: string;
}

export class CreateHighlightUseCase {
  execute(input: CreateHighlightInput): HighlightResult {
    const highlight = Highlight.create(input);
    return {
      turnId: highlight.turnId,
      startOffset: highlight.startOffset,
      endOffset: highlight.endOffset,
      highlightedText: highlight.highlightedText,
      autoQuote: highlight.toAutoQuote(),
    };
  }
}
