import { describe, it, expect } from "vitest";
import { CheckToneUseCase } from "../check-tone";

describe("CheckToneUseCase", () => {
  const uc = new CheckToneUseCase();

  it("returns ToneSuggestion with original and suggested text", () => {
    const result = uc.execute({
      originalText: "그건 틀렸어요",
      suggestedText: "저는 다르게 생각해요",
    });
    expect(result.originalText).toBe("그건 틀렸어요");
    expect(result.suggestedText).toBe("저는 다르게 생각해요");
    expect(result.isSuggested).toBe(true);
  });

  it("reports not suggested when texts are the same", () => {
    const result = uc.execute({
      originalText: "좋은 의견이네요",
      suggestedText: "좋은 의견이네요",
    });
    expect(result.isSuggested).toBe(false);
  });

  it("includes display delay constant", () => {
    const result = uc.execute({
      originalText: "text",
      suggestedText: "alt",
    });
    expect(result.displayDelayMs).toBe(500);
  });

  it("returns userChoice as null before selection", () => {
    const result = uc.execute({
      originalText: "text",
      suggestedText: "alt",
    });
    expect(result.userChoice).toBeNull();
  });
});
