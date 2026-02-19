import { describe, it, expect } from "vitest";
import { WriteGiftMessageUseCase } from "../write-gift-message";

describe("WriteGiftMessageUseCase", () => {
  const uc = new WriteGiftMessageUseCase();

  it("writes gift message with correct fields", () => {
    const result = uc.execute({ text: "좋은 대화였어요", writtenAtStep: "QUESTION" });
    expect(result.text).toBe("좋은 대화였어요");
    expect(result.writtenAtStep).toBe("QUESTION");
    expect(result.revealedAtPeakEnd).toBe(false);
  });

  it("throws on empty text", () => {
    expect(() => uc.execute({ text: "", writtenAtStep: "QUESTION" })).toThrow();
  });

  it("throws on text over 100 chars", () => {
    expect(() =>
      uc.execute({ text: "a".repeat(101), writtenAtStep: "QUESTION" }),
    ).toThrow();
  });
});
