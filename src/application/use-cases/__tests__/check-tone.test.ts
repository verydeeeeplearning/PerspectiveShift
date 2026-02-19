import { describe, it, expect } from "vitest";
import { CheckToneUseCase } from "../check-tone";
import type { ToneAlternative } from "@/domain/value-objects/tone-suggestion";

describe("CheckToneUseCase", () => {
  const uc = new CheckToneUseCase();

  // --- Existing backwards-compatible tests ---

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

  // --- New: alternatives in output ---

  it("returns default alternatives when none provided", () => {
    const result = uc.execute({
      originalText: "원본",
      suggestedText: "대안",
    });
    expect(result.alternatives).toHaveLength(1);
    expect(result.alternatives[0].text).toBe("대안");
    expect(result.alternatives[0].category).toBe("summary_confirm");
  });

  it("returns provided alternatives in output", () => {
    const alternatives: ToneAlternative[] = [
      { category: "summary_confirm", text: "요약해보면...", label: "요약+확인질문" },
      { category: "interest_reason", text: "왜 그렇게?", label: "관심+근거질문" },
      { category: "uncertainty", text: "잘 모르겠지만...", label: "불확실성 표현" },
    ];
    const result = uc.execute({
      originalText: "원본",
      suggestedText: "요약해보면...",
      alternatives,
    });
    expect(result.alternatives).toHaveLength(3);
    expect(result.alternatives[0].category).toBe("summary_confirm");
    expect(result.alternatives[1].category).toBe("interest_reason");
    expect(result.alternatives[2].category).toBe("uncertainty");
  });

  // --- Backwards compatibility: old callers without alternatives still work ---

  it("backwards compatible: old callers without alternatives get valid result", () => {
    const result = uc.execute({
      originalText: "공격적 표현",
      suggestedText: "부드러운 표현",
    });
    expect(result.originalText).toBe("공격적 표현");
    expect(result.suggestedText).toBe("부드러운 표현");
    expect(result.alternatives).toBeDefined();
    expect(result.alternatives.length).toBeGreaterThanOrEqual(1);
    expect(result.isSuggested).toBe(true);
    expect(result.displayDelayMs).toBe(500);
    expect(result.userChoice).toBeNull();
  });
});
