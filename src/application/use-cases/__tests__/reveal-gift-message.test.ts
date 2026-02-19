import { describe, it, expect } from "vitest";
import { RevealGiftMessageUseCase } from "../reveal-gift-message";

describe("RevealGiftMessageUseCase", () => {
  const uc = new RevealGiftMessageUseCase();

  it("reveals the gift message", () => {
    const result = uc.execute({ text: "생각이 넓어졌어요", writtenAtStep: "ANSWER" });
    expect(result.revealedAtPeakEnd).toBe(true);
    expect(result.text).toBe("생각이 넓어졌어요");
  });

  it("preserves writtenAtStep", () => {
    const result = uc.execute({ text: "감사합니다", writtenAtStep: "QUESTION" });
    expect(result.writtenAtStep).toBe("QUESTION");
  });
});
