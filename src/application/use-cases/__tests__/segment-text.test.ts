import { describe, it, expect } from "vitest";
import { SegmentTextUseCase } from "../segment-text";
import type { TextSegmenter } from "@/domain/interfaces/text-segmenter";
import { TextSegment } from "@/domain/value-objects/text-segment";

function createMockSegmenter(segments: TextSegment[]): TextSegmenter {
  return {
    segment: () => segments,
  };
}

describe("SegmentTextUseCase", () => {
  it("returns segments from the segmenter", () => {
    const mockSegments = [
      new TextSegment("seg-0", "첫 번째 문장.", 0, 8),
      new TextSegment("seg-1", "두 번째 문장.", 8, 16),
    ];
    const segmenter = createMockSegmenter(mockSegments);
    const useCase = new SegmentTextUseCase(segmenter);

    const result = useCase.execute({ text: "첫 번째 문장. 두 번째 문장." });

    expect(result.segments).toHaveLength(2);
    expect(result.segments[0].id).toBe("seg-0");
    expect(result.segments[0].text).toBe("첫 번째 문장.");
    expect(result.segments[0].isHighlighted).toBe(false);
    expect(result.segments[1].id).toBe("seg-1");
  });

  it("maps all segment properties correctly", () => {
    const mockSegments = [
      new TextSegment("seg-0", "테스트 문장.", 5, 12, true),
    ];
    const segmenter = createMockSegmenter(mockSegments);
    const useCase = new SegmentTextUseCase(segmenter);

    const result = useCase.execute({ text: "테스트" });
    const seg = result.segments[0];

    expect(seg.id).toBe("seg-0");
    expect(seg.text).toBe("테스트 문장.");
    expect(seg.startIndex).toBe(5);
    expect(seg.endIndex).toBe(12);
    expect(seg.isHighlighted).toBe(true);
  });

  it("returns empty segments for empty text", () => {
    const segmenter = createMockSegmenter([]);
    const useCase = new SegmentTextUseCase(segmenter);

    const result = useCase.execute({ text: "" });
    expect(result.segments).toHaveLength(0);
  });
});
