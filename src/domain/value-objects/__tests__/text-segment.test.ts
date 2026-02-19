import { describe, it, expect } from "vitest";
import { TextSegment } from "../text-segment";

describe("TextSegment", () => {
  it("creates a segment with default isHighlighted=false", () => {
    const seg = new TextSegment("seg-0", "안녕하세요.", 0, 6);
    expect(seg.id).toBe("seg-0");
    expect(seg.text).toBe("안녕하세요.");
    expect(seg.startIndex).toBe(0);
    expect(seg.endIndex).toBe(6);
    expect(seg.isHighlighted).toBe(false);
  });

  it("creates a segment with explicit isHighlighted=true", () => {
    const seg = new TextSegment("seg-1", "텍스트", 0, 3, true);
    expect(seg.isHighlighted).toBe(true);
  });

  it("toggle() returns a new segment with flipped isHighlighted", () => {
    const seg = new TextSegment("seg-0", "문장입니다.", 0, 6, false);
    const toggled = seg.toggle();

    expect(toggled.isHighlighted).toBe(true);
    expect(toggled.id).toBe("seg-0");
    expect(toggled.text).toBe("문장입니다.");
    expect(toggled.startIndex).toBe(0);
    expect(toggled.endIndex).toBe(6);
  });

  it("toggle() twice returns to original state", () => {
    const seg = new TextSegment("seg-0", "테스트", 0, 3, false);
    const doubleToggled = seg.toggle().toggle();
    expect(doubleToggled.isHighlighted).toBe(false);
  });

  it("toggle() does not mutate the original segment", () => {
    const seg = new TextSegment("seg-0", "불변성 확인", 0, 6, false);
    seg.toggle();
    expect(seg.isHighlighted).toBe(false);
  });

  it("equals() returns true for same id", () => {
    const a = new TextSegment("seg-0", "텍스트 A", 0, 5);
    const b = new TextSegment("seg-0", "텍스트 B", 10, 15);
    expect(a.equals(b)).toBe(true);
  });

  it("equals() returns false for different id", () => {
    const a = new TextSegment("seg-0", "텍스트", 0, 3);
    const b = new TextSegment("seg-1", "텍스트", 0, 3);
    expect(a.equals(b)).toBe(false);
  });
});
