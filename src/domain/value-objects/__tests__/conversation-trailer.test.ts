import { describe, it, expect } from "vitest";
import { ConversationTrailer } from "../conversation-trailer";

describe("ConversationTrailer", () => {
  it("creates trailer with valid text", () => {
    const trailer = ConversationTrailer.create(
      "이 분은 기술 규제에 신중하지만, 혁신의 가능성을 열어두는 편이에요.",
    );
    expect(trailer.text).toBeDefined();
    expect(trailer.text.length).toBeGreaterThan(0);
  });

  it("rejects text exceeding 80 chars", () => {
    const longText = "이".repeat(81);
    expect(() => ConversationTrailer.create(longText)).toThrow();
  });

  it("rejects empty text", () => {
    expect(() => ConversationTrailer.create("")).toThrow();
  });

  it("rejects text containing value labels (진보적)", () => {
    expect(() =>
      ConversationTrailer.create("이 분은 진보적인 성향이에요."),
    ).toThrow(/가치 라벨/);
  });

  it("rejects text containing value labels (보수적)", () => {
    expect(() =>
      ConversationTrailer.create("이 분은 보수적인 관점을 가지고 있어요."),
    ).toThrow(/가치 라벨/);
  });

  it("rejects text containing value labels (좌파/우파)", () => {
    expect(() =>
      ConversationTrailer.create("이 분은 좌파 성향이에요."),
    ).toThrow(/가치 라벨/);
  });

  it("allows valid non-labeling text", () => {
    const trailer = ConversationTrailer.create(
      "기술에 대해 열린 자세를 가진 분이에요.",
    );
    expect(trailer.text).toContain("기술");
  });
});
