import { describe, it, expect } from "vitest";
import { Highlight } from "../highlight";

describe("Highlight", () => {
  const validInput = {
    turnId: "turn-1",
    startOffset: 5,
    endOffset: 15,
    highlightedText: "중요한 부분",
  };

  it("creates a highlight with valid input", () => {
    const h = Highlight.create(validInput);
    expect(h.turnId).toBe("turn-1");
    expect(h.startOffset).toBe(5);
    expect(h.endOffset).toBe(15);
    expect(h.highlightedText).toBe("중요한 부분");
  });

  it("generates auto-quote prefix", () => {
    const h = Highlight.create(validInput);
    const quote = h.toAutoQuote();
    expect(quote).toContain("중요한 부분");
    expect(quote).toContain("라고 하셨는데,");
  });

  it("auto-quote ends with space for user to continue", () => {
    const h = Highlight.create(validInput);
    const quote = h.toAutoQuote();
    expect(quote.endsWith(" ")).toBe(true);
  });

  it("throws if startOffset >= endOffset", () => {
    expect(() =>
      Highlight.create({ ...validInput, startOffset: 15, endOffset: 5 }),
    ).toThrow();
  });

  it("throws if startOffset is negative", () => {
    expect(() =>
      Highlight.create({ ...validInput, startOffset: -1 }),
    ).toThrow();
  });

  it("throws if highlightedText is empty", () => {
    expect(() =>
      Highlight.create({ ...validInput, highlightedText: "" }),
    ).toThrow();
  });

  it("throws if highlightedText is only whitespace", () => {
    expect(() =>
      Highlight.create({ ...validInput, highlightedText: "   " }),
    ).toThrow();
  });

  it("trims highlighted text in auto-quote", () => {
    const h = Highlight.create({ ...validInput, highlightedText: "  중요한 부분  " });
    const quote = h.toAutoQuote();
    expect(quote).toContain('"중요한 부분"');
  });

  it("has readonly properties", () => {
    const h = Highlight.create(validInput);
    expect(h.turnId).toBe(validInput.turnId);
    expect(h.highlightedText).toBe(validInput.highlightedText);
  });
});
