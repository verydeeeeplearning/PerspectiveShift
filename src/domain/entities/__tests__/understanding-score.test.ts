import { describe, it, expect } from "vitest";
import { UnderstandingScore } from "../understanding-score";

describe("UnderstandingScore", () => {
  it("creates with valid score (0-1)", () => {
    const us = UnderstandingScore.create({
      id: "us-1",
      sessionId: "s-1",
      participantId: "p-1",
      score: 0.75,
      evaluation: "Good understanding of opponent's key arguments",
      createdAt: new Date(),
    });
    expect(us.score).toBe(0.75);
    expect(us.evaluation).toContain("Good understanding");
  });

  it("throws for score < 0", () => {
    expect(() =>
      UnderstandingScore.create({
        id: "us-1",
        sessionId: "s-1",
        participantId: "p-1",
        score: -0.1,
        evaluation: "test",
        createdAt: new Date(),
      }),
    ).toThrow();
  });

  it("throws for score > 1", () => {
    expect(() =>
      UnderstandingScore.create({
        id: "us-1",
        sessionId: "s-1",
        participantId: "p-1",
        score: 1.1,
        evaluation: "test",
        createdAt: new Date(),
      }),
    ).toThrow();
  });

  it("accepts boundary values", () => {
    expect(
      UnderstandingScore.create({
        id: "us-1",
        sessionId: "s-1",
        participantId: "p-1",
        score: 0,
        evaluation: "No understanding",
        createdAt: new Date(),
      }).score,
    ).toBe(0);

    expect(
      UnderstandingScore.create({
        id: "us-2",
        sessionId: "s-1",
        participantId: "p-1",
        score: 1,
        evaluation: "Perfect understanding",
        createdAt: new Date(),
      }).score,
    ).toBe(1);
  });
});
