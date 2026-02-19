import { describe, it, expect } from "vitest";
import { JointSummaryCard } from "../joint-summary-card";

describe("JointSummaryCard", () => {
  it("creates card with agreed and disagreed points", () => {
    const card = JointSummaryCard.create({
      agreedPoints: ["기술 발전은 필요하다"],
      disagreedPoints: ["규제의 범위"],
      sharedQuestion: "AI 교육에 대해",
      dialogueId: "d-1",
    });
    expect(card.agreedPoints).toHaveLength(1);
    expect(card.disagreedPoints).toHaveLength(1);
    expect(card.sharedQuestion).toContain("교육");
  });

  it("allows null sharedQuestion", () => {
    const card = JointSummaryCard.create({
      agreedPoints: ["A"], disagreedPoints: ["B"], sharedQuestion: null, dialogueId: "d-1",
    });
    expect(card.sharedQuestion).toBeNull();
  });

  it("requires at least one agreed or disagreed point", () => {
    expect(() => JointSummaryCard.create({
      agreedPoints: [], disagreedPoints: [], sharedQuestion: null, dialogueId: "d-1",
    })).toThrow();
  });

  it("stores dialogueId", () => {
    const card = JointSummaryCard.create({
      agreedPoints: ["A"], disagreedPoints: [], sharedQuestion: null, dialogueId: "d-99",
    });
    expect(card.dialogueId).toBe("d-99");
  });
});
