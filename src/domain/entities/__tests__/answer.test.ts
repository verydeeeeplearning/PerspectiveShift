import { describe, it, expect } from "vitest";
import { Answer } from "../answer";
import { InvalidRubricScoreError } from "../../errors/domain-errors";

describe("Answer", () => {
  describe("ox", () => {
    it("creates OX answer with true", () => {
      const a = Answer.ox(1, true);
      expect(a.questionId).toBe(1);
      expect(a.value).toBe(true);
      expect(a.isOx()).toBe(true);
    });

    it("creates OX answer with false", () => {
      const a = Answer.ox(1, false);
      expect(a.value).toBe(false);
    });

    it("is not rubric or open ended", () => {
      const a = Answer.ox(1, true);
      expect(a.isRubric()).toBe(false);
      expect(a.isOpenEnded()).toBe(false);
    });
  });

  describe("rubric", () => {
    it("creates rubric answer with valid score", () => {
      const a = Answer.rubric(4, 3);
      expect(a.questionId).toBe(4);
      expect(a.value).toBe(3);
      expect(a.isRubric()).toBe(true);
    });

    it("accepts score 1", () => {
      expect(Answer.rubric(4, 1).value).toBe(1);
    });

    it("accepts score 5", () => {
      expect(Answer.rubric(4, 5).value).toBe(5);
    });

    it("throws for score 0", () => {
      expect(() => Answer.rubric(4, 0)).toThrow(
        InvalidRubricScoreError,
      );
    });

    it("throws for score 6", () => {
      expect(() => Answer.rubric(4, 6)).toThrow(
        InvalidRubricScoreError,
      );
    });

    it("throws for non-integer score", () => {
      expect(() => Answer.rubric(4, 2.5)).toThrow(
        InvalidRubricScoreError,
      );
    });
  });

  describe("openEnded", () => {
    it("creates open-ended answer", () => {
      const a = Answer.openEnded(9, "한국 사회에서 가장 시급한 것은...");
      expect(a.questionId).toBe(9);
      expect(a.value).toBe("한국 사회에서 가장 시급한 것은...");
      expect(a.isOpenEnded()).toBe(true);
    });

    it("trims whitespace", () => {
      const a = Answer.openEnded(9, "  답변  ");
      expect(a.value).toBe("답변");
    });
  });

  describe("answeredAt", () => {
    it("records timestamp", () => {
      const before = new Date();
      const a = Answer.ox(1, true);
      const after = new Date();
      expect(a.answeredAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(a.answeredAt.getTime()).toBeLessThanOrEqual(
        after.getTime(),
      );
    });
  });
});
