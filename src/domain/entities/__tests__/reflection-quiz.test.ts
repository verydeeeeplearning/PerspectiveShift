import { describe, it, expect } from "vitest";
import { ReflectionQuiz } from "../reflection-quiz";

describe("ReflectionQuiz", () => {
  it("creates quiz with 4 options and correct index", () => {
    const quiz = ReflectionQuiz.create({
      options: ["A", "B", "C", "D"],
      correctIndex: 1,
      dialogueId: "d-1",
    });
    expect(quiz.options).toHaveLength(4);
    expect(quiz.correctIndex).toBe(1);
  });

  it("checks answer correctness", () => {
    const quiz = ReflectionQuiz.create({
      options: ["A", "B", "C", "D"],
      correctIndex: 2,
      dialogueId: "d-1",
    });
    expect(quiz.isCorrect(2)).toBe(true);
    expect(quiz.isCorrect(0)).toBe(false);
  });

  it("returns correct option text", () => {
    const quiz = ReflectionQuiz.create({
      options: ["A", "B", "정답", "D"],
      correctIndex: 2,
      dialogueId: "d-1",
    });
    expect(quiz.correctOptionText).toBe("정답");
  });

  it("throws if not exactly 4 options", () => {
    expect(() =>
      ReflectionQuiz.create({ options: ["A", "B"], correctIndex: 0, dialogueId: "d-1" }),
    ).toThrow();
  });

  it("throws if correctIndex is out of range", () => {
    expect(() =>
      ReflectionQuiz.create({ options: ["A", "B", "C", "D"], correctIndex: 5, dialogueId: "d-1" }),
    ).toThrow();
  });

  it("throws if correctIndex is negative", () => {
    expect(() =>
      ReflectionQuiz.create({ options: ["A", "B", "C", "D"], correctIndex: -1, dialogueId: "d-1" }),
    ).toThrow();
  });

  it("stores dialogueId", () => {
    const quiz = ReflectionQuiz.create({
      options: ["A", "B", "C", "D"],
      correctIndex: 0,
      dialogueId: "d-123",
    });
    expect(quiz.dialogueId).toBe("d-123");
  });
});
