import { describe, it, expect } from "vitest";
import { Question } from "../question";
import { QuestionType } from "../../value-objects/question-type";
import { StanceDimension } from "../../value-objects/stance-dimension";
import { InvalidQuestionIdError } from "../../errors/domain-errors";

describe("Question", () => {
  const validProps = {
    id: 1,
    text: "AI 기술 발전에 대한 정부의 규제가 더 강화되어야 한다",
    type: QuestionType.OX as const,
    dimension: StanceDimension.TECH_REGULATION,
    phase: "core" as const,
    polarity: 1 as const,
  };

  describe("create", () => {
    it("creates a valid question", () => {
      const q = Question.create(validProps);
      expect(q.id).toBe(1);
      expect(q.type).toBe(QuestionType.OX);
      expect(q.dimension).toBe(StanceDimension.TECH_REGULATION);
    });

    it("accepts ID 1", () => {
      expect(Question.create({ ...validProps, id: 1 }).id).toBe(1);
    });

    it("accepts ID 10", () => {
      expect(Question.create({ ...validProps, id: 10 }).id).toBe(10);
    });

    it("throws for ID 0", () => {
      expect(() =>
        Question.create({ ...validProps, id: 0 }),
      ).toThrow(InvalidQuestionIdError);
    });

    it("throws for ID 11", () => {
      expect(() =>
        Question.create({ ...validProps, id: 11 }),
      ).toThrow(InvalidQuestionIdError);
    });

    it("throws for non-integer ID", () => {
      expect(() =>
        Question.create({ ...validProps, id: 1.5 }),
      ).toThrow(InvalidQuestionIdError);
    });
  });

  describe("isCore / isExtended", () => {
    it("returns true for core phase", () => {
      const q = Question.create(validProps);
      expect(q.isCore()).toBe(true);
      expect(q.isExtended()).toBe(false);
    });

    it("returns true for extended phase", () => {
      const q = Question.create({
        ...validProps,
        id: 6,
        phase: "extended",
      });
      expect(q.isCore()).toBe(false);
      expect(q.isExtended()).toBe(true);
    });
  });
});
