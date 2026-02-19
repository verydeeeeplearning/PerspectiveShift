import { describe, it, expect } from "vitest";
import { BuildJointSummaryCardUseCase } from "../build-joint-summary-card";

describe("BuildJointSummaryCardUseCase", () => {
  const uc = new BuildJointSummaryCardUseCase();

  it("builds card with agreed and disagreed points", () => {
    const result = uc.execute({
      agreedPoints: ["환경 보호 중요"],
      disagreedPoints: ["원전 방식"],
      sharedQuestion: "최적의 에너지 믹스는?",
      dialogueId: "d-1",
    });
    expect(result.agreedPoints).toEqual(["환경 보호 중요"]);
    expect(result.disagreedPoints).toEqual(["원전 방식"]);
    expect(result.sharedQuestion).toBe("최적의 에너지 믹스는?");
  });

  it("defaults sharedQuestion to null when omitted", () => {
    const result = uc.execute({
      agreedPoints: ["a"],
      disagreedPoints: [],
      dialogueId: "d-2",
    });
    expect(result.sharedQuestion).toBeNull();
  });

  it("throws when no points provided", () => {
    expect(() =>
      uc.execute({ agreedPoints: [], disagreedPoints: [], dialogueId: "d-3" }),
    ).toThrow();
  });
});
