import type { TextSegmenter } from "@/domain/interfaces/text-segmenter";

export interface SegmentTextInput {
  text: string;
}

export interface SegmentTextOutput {
  segments: Array<{
    id: string;
    text: string;
    startIndex: number;
    endIndex: number;
    isHighlighted: boolean;
  }>;
}

export class SegmentTextUseCase {
  constructor(private segmenter: TextSegmenter) {}

  execute(input: SegmentTextInput): SegmentTextOutput {
    const segments = this.segmenter.segment(input.text);
    return {
      segments: segments.map((s) => ({
        id: s.id,
        text: s.text,
        startIndex: s.startIndex,
        endIndex: s.endIndex,
        isHighlighted: s.isHighlighted,
      })),
    };
  }
}
