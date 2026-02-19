import { describe, it, expect } from "vitest";
import { CreateHighlightUseCase } from "../create-highlight";

describe("CreateHighlightUseCase", () => {
  const uc = new CreateHighlightUseCase();

  it("creates highlight and returns auto-quote", () => {
    const result = uc.execute({
      turnId: "turn-1",
      startOffset: 0,
      endOffset: 10,
      highlightedText: "흥미로운 의견",
    });
    expect(result.autoQuote).toContain("흥미로운 의견");
    expect(result.autoQuote).toContain("라고 하셨는데,");
  });

  it("returns turnId in result", () => {
    const result = uc.execute({
      turnId: "turn-abc",
      startOffset: 5,
      endOffset: 15,
      highlightedText: "텍스트",
    });
    expect(result.turnId).toBe("turn-abc");
  });

  it("returns highlight offsets", () => {
    const result = uc.execute({
      turnId: "turn-1",
      startOffset: 3,
      endOffset: 8,
      highlightedText: "부분",
    });
    expect(result.startOffset).toBe(3);
    expect(result.endOffset).toBe(8);
  });

  it("throws for invalid offsets", () => {
    expect(() =>
      uc.execute({
        turnId: "turn-1",
        startOffset: 10,
        endOffset: 5,
        highlightedText: "텍스트",
      }),
    ).toThrow();
  });

  it("throws for empty highlighted text", () => {
    expect(() =>
      uc.execute({
        turnId: "turn-1",
        startOffset: 0,
        endOffset: 5,
        highlightedText: "",
      }),
    ).toThrow();
  });
});
