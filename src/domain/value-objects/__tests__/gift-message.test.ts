import { describe, it, expect } from "vitest";
import { GiftMessage } from "../gift-message";

describe("GiftMessage", () => {
  it("creates with valid text", () => {
    const gm = GiftMessage.create({ text: "대화 즐거웠어요", writtenAtStep: "QUESTION" });
    expect(gm.text).toBe("대화 즐거웠어요");
    expect(gm.revealedAtPeakEnd).toBe(false);
  });

  it("limits text to 100 chars", () => {
    const longText = "가".repeat(101);
    expect(() => GiftMessage.create({ text: longText, writtenAtStep: "QUESTION" })).toThrow();
  });

  it("throws for empty text", () => {
    expect(() => GiftMessage.create({ text: "", writtenAtStep: "QUESTION" })).toThrow();
  });

  it("marks as revealed", () => {
    const gm = GiftMessage.create({ text: "감사합니다", writtenAtStep: "QUESTION" });
    const revealed = gm.reveal();
    expect(revealed.revealedAtPeakEnd).toBe(true);
  });

  it("stores writtenAtStep", () => {
    const gm = GiftMessage.create({ text: "text", writtenAtStep: "ANSWER" });
    expect(gm.writtenAtStep).toBe("ANSWER");
  });
});
