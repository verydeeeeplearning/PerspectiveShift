import { describe, it, expect } from "vitest";
import {
  ToneSuggestion,
  type ToneUserChoice,
} from "../tone-suggestion";

describe("ToneSuggestion", () => {
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

  it("returns new instance with USE_SUGGESTION choice", () => {
    const ts = ToneSuggestion.create({
      originalText: "original",
      suggestedText: "suggested",
    });
    const chosen = ts.choose("USE_SUGGESTION");
    expect(chosen.userChoice).toBe("USE_SUGGESTION");
    expect(chosen.finalText).toBe("suggested");
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
});
