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

  // --- v4 P0-D2: Enhanced JointSummaryCard fields ---

  describe("v4 enhanced fields", () => {
    it("includes all enhanced fields in output", () => {
      const result = uc.execute({
        agreedPoints: ["환경 보호 중요"],
        disagreedPoints: ["원전 방식"],
        sharedQuestion: "에너지 믹스?",
        dialogueId: "d-10",
        topic: "에너지 정책",
        date: "2026-02-19",
        myKeyPoint: "신재생 에너지 확대",
        opponentKeyPoint: "원전이 현실적",
        commonGround: "탄소 감축 필요",
        newDiscovery: "원전 안전성 개선됨",
        understandingScore: 0.8,
        feelHeardScore: 4,
        autoSaved: true,
      });
      expect(result.topic).toBe("에너지 정책");
      expect(result.date).toBe("2026-02-19");
      expect(result.myKeyPoint).toBe("신재생 에너지 확대");
      expect(result.opponentKeyPoint).toBe("원전이 현실적");
      expect(result.commonGround).toBe("탄소 감축 필요");
      expect(result.newDiscovery).toBe("원전 안전성 개선됨");
      expect(result.understandingScore).toBe(0.8);
      expect(result.feelHeardScore).toBe(4);
      expect(result.autoSaved).toBe(true);
    });

    it("defaults enhanced fields when not provided", () => {
      const result = uc.execute({
        agreedPoints: ["a"],
        disagreedPoints: [],
        dialogueId: "d-5",
      });
      expect(result.topic).toBe("");
      expect(result.date).toBe("");
      expect(result.myKeyPoint).toBe("");
      expect(result.opponentKeyPoint).toBe("");
      expect(result.commonGround).toBeNull();
      expect(result.newDiscovery).toBeNull();
      expect(result.understandingScore).toBe(0);
      expect(result.feelHeardScore).toBe(0);
      expect(result.autoSaved).toBe(true);
    });

    it("validates understandingScore through entity", () => {
      expect(() =>
        uc.execute({
          agreedPoints: ["a"],
          disagreedPoints: [],
          dialogueId: "d-6",
          understandingScore: 2.0,
        }),
      ).toThrow("Understanding score must be between 0 and 1");
    });

    it("validates feelHeardScore through entity", () => {
      expect(() =>
        uc.execute({
          agreedPoints: ["a"],
          disagreedPoints: [],
          dialogueId: "d-7",
          feelHeardScore: 6,
        }),
      ).toThrow("Feel heard score must be between 1 and 5");
    });
  });
});
