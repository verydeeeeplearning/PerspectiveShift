import { TextSegment } from "@/domain/value-objects/text-segment";

export interface CreateHighlightByTapInput {
  segmentId: string;
  segments: Array<{
    id: string;
    text: string;
    startIndex: number;
    endIndex: number;
    isHighlighted: boolean;
  }>;
}

export interface CreateHighlightByTapOutput {
  segments: Array<{
    id: string;
    text: string;
    startIndex: number;
    endIndex: number;
    isHighlighted: boolean;
  }>;
  highlightedTexts: string[];
}

export class CreateHighlightByTapUseCase {
  execute(input: CreateHighlightByTapInput): CreateHighlightByTapOutput {
    const segments = input.segments.map((s) => {
      const segment = new TextSegment(
        s.id,
        s.text,
        s.startIndex,
        s.endIndex,
        s.isHighlighted,
      );
      if (s.id === input.segmentId) {
        return segment.toggle();
      }
      return segment;
    });

    return {
      segments: segments.map((s) => ({
        id: s.id,
        text: s.text,
        startIndex: s.startIndex,
        endIndex: s.endIndex,
        isHighlighted: s.isHighlighted,
      })),
      highlightedTexts: segments
        .filter((s) => s.isHighlighted)
        .map((s) => s.text),
    };
  }
}
