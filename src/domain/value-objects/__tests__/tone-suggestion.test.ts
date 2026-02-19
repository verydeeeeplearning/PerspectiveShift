import { describe, it, expect } from "vitest";
import {
  ToneSuggestion,
  type ToneAlternative,
} from "../tone-suggestion";

describe("ToneSuggestion", () => {
  // --- Existing backwards-compatible tests ---

  it("creates a tone suggestion with original and suggested text", () => {
    const ts = ToneSuggestion.create({
      originalText: "그건 완전히 틀렸어요",
      suggestedText: "저는 다르게 생각하는데요",
    });
    expect(ts.originalText).toBe("그건 완전히 틀렸어요");
    expect(ts.suggestedText).toBe("저는 다르게 생각하는데요");
  });

  it("defaults userChoice to null before selection", () => {
    const ts = ToneSuggestion.create({
      originalText: "original",
      suggestedText: "suggested",
    });
    expect(ts.userChoice).toBeNull();
  });

  it("returns new instance with SEND_ORIGINAL choice", () => {
    const ts = ToneSuggestion.create({
      originalText: "original",
      suggestedText: "suggested",
    });
    const chosen = ts.choose("SEND_ORIGINAL");
    expect(chosen.userChoice).toBe("SEND_ORIGINAL");
    expect(chosen.finalText).toBe("original");
  });

  it("has DISPLAY_DELAY_MS constant of 500", () => {
    expect(ToneSuggestion.DISPLAY_DELAY_MS).toBe(500);
  });

  it("isSuggested returns true when suggestion differs from original", () => {
    const ts = ToneSuggestion.create({
      originalText: "공격적",
      suggestedText: "부드러운",
    });
    expect(ts.isSuggested).toBe(true);
  });

  it("isSuggested returns false when same text", () => {
    const ts = ToneSuggestion.create({
      originalText: "같은 문장",
      suggestedText: "같은 문장",
    });
    expect(ts.isSuggested).toBe(false);
  });

  it("throws if originalText is empty", () => {
    expect(() =>
      ToneSuggestion.create({ originalText: "", suggestedText: "alt" }),
    ).toThrow();
  });

  it("throws if suggestedText is empty", () => {
    expect(() =>
      ToneSuggestion.create({ originalText: "text", suggestedText: "" }),
    ).toThrow();
  });

  // --- Backwards compatibility: create() without alternatives ---

  it("creates default alternatives array when none provided", () => {
    const ts = ToneSuggestion.create({
      originalText: "원본 텍스트",
      suggestedText: "추천 텍스트",
    });
    expect(ts.alternatives).toHaveLength(1);
    expect(ts.alternatives[0].text).toBe("추천 텍스트");
    expect(ts.alternatives[0].category).toBe("summary_confirm");
    expect(ts.alternatives[0].label).toBe("추천 표현");
  });

  // --- Multi-alternative model tests ---

  it("creates with explicit alternatives array", () => {
    const alternatives: ToneAlternative[] = [
      { category: "summary_confirm", text: "요약해보면, ~라는 뜻이죠?", label: "요약+확인질문" },
      { category: "interest_reason", text: "흥미로운데요, 왜 그렇게 생각하시나요?", label: "관심+근거질문" },
      { category: "uncertainty", text: "제가 잘 이해했는지 모르겠지만...", label: "불확실성 표현" },
    ];
    const ts = ToneSuggestion.create({
      originalText: "그건 틀렸어요",
      suggestedText: "요약해보면, ~라는 뜻이죠?",
      alternatives,
    });
    expect(ts.alternatives).toHaveLength(3);
    expect(ts.alternatives[0].category).toBe("summary_confirm");
    expect(ts.alternatives[1].category).toBe("interest_reason");
    expect(ts.alternatives[2].category).toBe("uncertainty");
  });

  it("alternatives are frozen (immutable)", () => {
    const ts = ToneSuggestion.create({
      originalText: "원본",
      suggestedText: "대안",
      alternatives: [
        { category: "summary_confirm", text: "대안", label: "요약+확인질문" },
      ],
    });
    expect(() => {
      (ts.alternatives as ToneAlternative[]).push({
        category: "interest_reason",
        text: "추가",
        label: "추가",
      });
    }).toThrow();
  });

  // --- finalText with USE_ALTERNATIVE_A/B/C ---

  it("finalText returns alternative A text when USE_ALTERNATIVE_A chosen", () => {
    const alternatives: ToneAlternative[] = [
      { category: "summary_confirm", text: "대안A", label: "A" },
      { category: "interest_reason", text: "대안B", label: "B" },
      { category: "uncertainty", text: "대안C", label: "C" },
    ];
    const ts = ToneSuggestion.create({
      originalText: "원본",
      suggestedText: "대안A",
      alternatives,
    });
    const chosen = ts.choose("USE_ALTERNATIVE_A");
    expect(chosen.finalText).toBe("대안A");
  });

  it("finalText returns alternative B text when USE_ALTERNATIVE_B chosen", () => {
    const alternatives: ToneAlternative[] = [
      { category: "summary_confirm", text: "대안A", label: "A" },
      { category: "interest_reason", text: "대안B", label: "B" },
      { category: "uncertainty", text: "대안C", label: "C" },
    ];
    const ts = ToneSuggestion.create({
      originalText: "원본",
      suggestedText: "대안A",
      alternatives,
    });
    const chosen = ts.choose("USE_ALTERNATIVE_B");
    expect(chosen.finalText).toBe("대안B");
  });

  it("finalText returns alternative C text when USE_ALTERNATIVE_C chosen", () => {
    const alternatives: ToneAlternative[] = [
      { category: "summary_confirm", text: "대안A", label: "A" },
      { category: "interest_reason", text: "대안B", label: "B" },
      { category: "uncertainty", text: "대안C", label: "C" },
    ];
    const ts = ToneSuggestion.create({
      originalText: "원본",
      suggestedText: "대안A",
      alternatives,
    });
    const chosen = ts.choose("USE_ALTERNATIVE_C");
    expect(chosen.finalText).toBe("대안C");
  });

  it("finalText returns original when alternative index out of bounds", () => {
    const ts = ToneSuggestion.create({
      originalText: "원본",
      suggestedText: "대안A",
      alternatives: [
        { category: "summary_confirm", text: "대안A", label: "A" },
      ],
    });
    // Only 1 alternative but choosing B (index 1)
    const chosen = ts.choose("USE_ALTERNATIVE_B");
    expect(chosen.finalText).toBe("원본");
  });

  // --- choose() preserves alternatives ---

  it("choose() preserves alternatives in new instance", () => {
    const alternatives: ToneAlternative[] = [
      { category: "summary_confirm", text: "대안A", label: "A" },
      { category: "interest_reason", text: "대안B", label: "B" },
    ];
    const ts = ToneSuggestion.create({
      originalText: "원본",
      suggestedText: "대안A",
      alternatives,
    });
    const chosen = ts.choose("USE_ALTERNATIVE_A");
    expect(chosen.alternatives).toHaveLength(2);
    expect(chosen.alternatives[0].text).toBe("대안A");
    expect(chosen.alternatives[1].text).toBe("대안B");
  });

  // --- No warning/detection language ---

  it("does not contain warning/detection language in any output", () => {
    const ts = ToneSuggestion.create({
      originalText: "원본",
      suggestedText: "대안",
    });
    const json = JSON.stringify(ts);
    expect(json).not.toContain("경고");
    expect(json).not.toContain("감지");
    expect(json).not.toContain("부적절");
  });
});
