import { describe, it, expect } from "vitest";
import { CreateHighlightByTapUseCase } from "../create-highlight-by-tap";

describe("CreateHighlightByTapUseCase", () => {
  const baseSegments = [
    { id: "seg-0", text: "나는 동의합니다.", startIndex: 0, endIndex: 9, isHighlighted: false },
    { id: "seg-1", text: "하지만 다른 관점도 있어요.", startIndex: 10, endIndex: 24, isHighlighted: false },
  ];

  it("toggles the tapped segment to highlighted", () => {
    const useCase = new CreateHighlightByTapUseCase();
    const result = useCase.execute({
      segmentId: "seg-0",
      segments: baseSegments,
    });

    expect(result.segments[0].isHighlighted).toBe(true);
    expect(result.segments[1].isHighlighted).toBe(false);
  });

  it("returns highlighted texts array", () => {
    const useCase = new CreateHighlightByTapUseCase();
    const result = useCase.execute({
      segmentId: "seg-0",
      segments: baseSegments,
    });

    expect(result.highlightedTexts).toEqual(["나는 동의합니다."]);
  });

  it("toggles off an already highlighted segment", () => {
    const useCase = new CreateHighlightByTapUseCase();
    const highlightedSegments = [
      { id: "seg-0", text: "나는 동의합니다.", startIndex: 0, endIndex: 9, isHighlighted: true },
      { id: "seg-1", text: "하지만 다른 관점도 있어요.", startIndex: 10, endIndex: 24, isHighlighted: false },
    ];
    const result = useCase.execute({
      segmentId: "seg-0",
      segments: highlightedSegments,
    });

    expect(result.segments[0].isHighlighted).toBe(false);
    expect(result.highlightedTexts).toEqual([]);
  });

  it("can highlight multiple segments", () => {
    const useCase = new CreateHighlightByTapUseCase();

    // First tap
    const firstResult = useCase.execute({
      segmentId: "seg-0",
      segments: baseSegments,
    });

    // Second tap
    const secondResult = useCase.execute({
      segmentId: "seg-1",
      segments: firstResult.segments,
    });

    expect(secondResult.segments[0].isHighlighted).toBe(true);
    expect(secondResult.segments[1].isHighlighted).toBe(true);
    expect(secondResult.highlightedTexts).toEqual([
      "나는 동의합니다.",
      "하지만 다른 관점도 있어요.",
    ]);
  });

  it("does not modify segments that are not tapped", () => {
    const useCase = new CreateHighlightByTapUseCase();
    const result = useCase.execute({
      segmentId: "seg-0",
      segments: baseSegments,
    });

    expect(result.segments[1]).toEqual(baseSegments[1]);
  });

  it("preserves segment properties after toggle", () => {
    const useCase = new CreateHighlightByTapUseCase();
    const result = useCase.execute({
      segmentId: "seg-0",
      segments: baseSegments,
    });

    expect(result.segments[0].id).toBe("seg-0");
    expect(result.segments[0].text).toBe("나는 동의합니다.");
    expect(result.segments[0].startIndex).toBe(0);
    expect(result.segments[0].endIndex).toBe(9);
  });
});
