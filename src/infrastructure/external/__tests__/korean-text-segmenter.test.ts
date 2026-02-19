import { describe, it, expect } from "vitest";
import { KoreanTextSegmenter } from "../korean-text-segmenter";

describe("KoreanTextSegmenter", () => {
  const segmenter = new KoreanTextSegmenter();

  it("splits on period (마침표)", () => {
    const segments = segmenter.segment("나는 동의합니다. 하지만 다른 관점도 있어요.");
    expect(segments).toHaveLength(2);
    expect(segments[0].text).toBe("나는 동의합니다.");
    expect(segments[1].text.trim()).toBe("하지만 다른 관점도 있어요.");
  });

  it("splits on question mark and exclamation mark", () => {
    const segments = segmenter.segment("이건 맞아요? 그래서 중요합니다!");
    expect(segments).toHaveLength(2);
    expect(segments[0].text).toBe("이건 맞아요?");
    expect(segments[1].text.trim()).toBe("그래서 중요합니다!");
  });

  it("splits before Korean conjunctions", () => {
    const segments = segmenter.segment("이것은 사실입니다. 하지만 예외가 있습니다.");
    expect(segments).toHaveLength(2);
  });

  it("splits before conjunction '그래서'", () => {
    const text = "결과가 좋습니다. 그래서 계속합니다.";
    const segments = segmenter.segment(text);
    expect(segments.length).toBeGreaterThanOrEqual(2);
  });

  it("splits before conjunction '다만'", () => {
    const text = "원칙적으로 동의합니다. 다만 조건이 있습니다.";
    const segments = segmenter.segment(text);
    expect(segments.length).toBeGreaterThanOrEqual(2);
  });

  it("splits before conjunction '그러나'", () => {
    const text = "좋은 의견입니다. 그러나 현실은 다릅니다.";
    const segments = segmenter.segment(text);
    expect(segments.length).toBeGreaterThanOrEqual(2);
  });

  it("splits before conjunction '그런데'", () => {
    const text = "맞습니다. 그런데 한 가지 궁금합니다.";
    const segments = segmenter.segment(text);
    expect(segments.length).toBeGreaterThanOrEqual(2);
  });

  it("splits before conjunction '그렇지만'", () => {
    const text = "사실입니다. 그렇지만 반대 의견도 있습니다.";
    const segments = segmenter.segment(text);
    expect(segments.length).toBeGreaterThanOrEqual(2);
  });

  it("splits before conjunction '반면에'", () => {
    const text = "이쪽은 찬성합니다. 반면에 저쪽은 반대합니다.";
    const segments = segmenter.segment(text);
    expect(segments.length).toBeGreaterThanOrEqual(2);
  });

  it("splits before conjunction '그럼에도'", () => {
    const text = "어렵습니다. 그럼에도 시도해야 합니다.";
    const segments = segmenter.segment(text);
    expect(segments.length).toBeGreaterThanOrEqual(2);
  });

  it("assigns auto-generated segment IDs", () => {
    const segments = segmenter.segment("첫째. 둘째. 셋째.");
    expect(segments[0].id).toBe("seg-0");
    expect(segments[1].id).toBe("seg-1");
    expect(segments[2].id).toBe("seg-2");
  });

  it("sets correct startIndex and endIndex", () => {
    const text = "짧은 문장. 긴 문장이 있습니다.";
    const segments = segmenter.segment(text);
    expect(segments[0].startIndex).toBe(0);
    expect(segments[0].endIndex).toBe(segments[0].text.length);
    expect(segments[1].startIndex).toBe(segments[0].text.length);
  });

  it("all segments default to isHighlighted=false", () => {
    const segments = segmenter.segment("문장 하나. 문장 둘.");
    for (const seg of segments) {
      expect(seg.isHighlighted).toBe(false);
    }
  });

  it("handles single sentence without splitting", () => {
    const segments = segmenter.segment("하나의 문장입니다");
    expect(segments).toHaveLength(1);
    expect(segments[0].text).toBe("하나의 문장입니다");
  });

  it("returns empty array for empty string", () => {
    const segments = segmenter.segment("");
    expect(segments).toHaveLength(0);
  });

  it("preserves whitespace in original text", () => {
    const text = "첫째.  둘째.";
    const segments = segmenter.segment(text);
    // The combined text of all segments should equal the original text
    const combined = segments.map((s) => s.text).join("");
    expect(combined).toBe(text);
  });
});
