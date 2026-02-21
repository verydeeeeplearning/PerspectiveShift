import { describe, it, expect } from "vitest";
import { PrecisionScore } from "../precision-score";

describe("PrecisionScore", () => {
  describe("calculate", () => {
    it("calculates precision for 5 answered questions with full consistency (~31%)", () => {
      const score = PrecisionScore.calculate(5, 1.0);
      expect(score.value).toBeGreaterThanOrEqual(25);
      expect(score.value).toBeLessThanOrEqual(35);
    });

    it("calculates higher precision for 10 questions", () => {
      const score5 = PrecisionScore.calculate(5, 1.0);
      const score10 = PrecisionScore.calculate(10, 1.0);
      expect(score10.value).toBeGreaterThan(score5.value);
    });

    it("calculates highest precision for 20 questions", () => {
      const score10 = PrecisionScore.calculate(10, 1.0);
      const score20 = PrecisionScore.calculate(20, 1.0);
      expect(score20.value).toBeGreaterThan(score10.value);
    });

    it("lower consistency reduces precision", () => {
      const highConsistency = PrecisionScore.calculate(10, 1.0);
      const lowConsistency = PrecisionScore.calculate(10, 0.5);
      expect(highConsistency.value).toBeGreaterThan(lowConsistency.value);
    });

    it("precision is monotonically increasing with answer count", () => {
      const scores = [5, 8, 10, 15, 20].map((n) =>
        PrecisionScore.calculate(n, 1.0),
      );
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i].value).toBeGreaterThan(scores[i - 1].value);
      }
    });

    it("clamps value between 0 and 100", () => {
      const low = PrecisionScore.calculate(0, 0);
      const high = PrecisionScore.calculate(20, 1.0);
      expect(low.value).toBeGreaterThanOrEqual(0);
      expect(high.value).toBeLessThanOrEqual(100);
    });

    it("throws for negative answer count", () => {
      expect(() => PrecisionScore.calculate(-1, 1.0)).toThrow(
        "Answer count must be non-negative",
      );
    });

    it("clamps consistency to 0-1 range", () => {
      const score = PrecisionScore.calculate(5, 1.5);
      const capped = PrecisionScore.calculate(5, 1.0);
      expect(score.value).toBe(capped.value);
    });
  });

  describe("label", () => {
    it("returns appropriate label for low precision", () => {
      const score = PrecisionScore.calculate(3, 0.5);
      expect(score.label).toBeDefined();
      expect(typeof score.label).toBe("string");
    });

    it("returns percentage string", () => {
      const score = PrecisionScore.calculate(5, 1.0);
      expect(score.displayText).toMatch(/\d+%/);
    });
  });

  describe("nextMilestone", () => {
    it("returns next milestone for 5 questions answered", () => {
      const score = PrecisionScore.calculate(5, 1.0);
      const milestone = score.nextMilestone();
      expect(milestone).not.toBeNull();
      expect(milestone!.targetQuestions).toBeGreaterThan(5);
      expect(milestone!.targetPrecision).toBeGreaterThan(score.value);
      expect(milestone!.additionalQuestions).toBeGreaterThan(0);
    });

    it("returns null when max precision reached", () => {
      const score = PrecisionScore.calculate(50, 1.0);
      const milestone = score.nextMilestone();
      expect(milestone).toBeNull();
    });

    it("includes estimated time for additional questions", () => {
      const score = PrecisionScore.calculate(5, 1.0);
      const milestone = score.nextMilestone();
      expect(milestone!.estimatedMinutes).toBeGreaterThan(0);
    });
  });
});
