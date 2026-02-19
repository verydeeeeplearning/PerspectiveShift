import { describe, it, expect } from "vitest";
import { JointSummary } from "../joint-summary";

describe("JointSummary", () => {
  it("creates with agreed/disagreed/questions", () => {
    const summary = JointSummary.create({
      sessionId: "sess-1",
      agreedPoints: ["안전이 중요하다"],
      disagreedPoints: ["규제 정도"],
      sharedQuestions: ["어떤 규제가 효과적인가?"],
      llmGenerated: true,
    });

    expect(summary.agreedPoints).toEqual(["안전이 중요하다"]);
    expect(summary.disagreedPoints).toEqual(["규제 정도"]);
    expect(summary.sharedQuestions).toEqual(["어떤 규제가 효과적인가?"]);
    expect(summary.llmGenerated).toBe(true);
  });

  it("allows empty arrays", () => {
    const summary = JointSummary.create({
      sessionId: "sess-1",
      agreedPoints: [],
      disagreedPoints: [],
      sharedQuestions: [],
      llmGenerated: false,
    });

    expect(summary.agreedPoints).toEqual([]);
  });

  it("creates with user-generated flag", () => {
    const summary = JointSummary.create({
      sessionId: "sess-1",
      agreedPoints: ["동의"],
      disagreedPoints: [],
      sharedQuestions: [],
      llmGenerated: false,
    });

    expect(summary.llmGenerated).toBe(false);
  });

  it("has session reference", () => {
    const summary = JointSummary.create({
      sessionId: "sess-abc",
      agreedPoints: [],
      disagreedPoints: [],
      sharedQuestions: [],
      llmGenerated: true,
    });

    expect(summary.sessionId).toBe("sess-abc");
  });
});
