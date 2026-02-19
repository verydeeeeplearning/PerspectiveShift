import { describe, it, expect } from "vitest";
import { TuringGuess } from "../turing-guess";

describe("TuringGuess", () => {
  it("sets isCorrect based on guess vs actual", () => {
    const guess = TuringGuess.create({
      id: "tg-1",
      userId: "u-1",
      dialogueSessionId: "d-1",
      guess: "human",
      actual: "human",
      createdAt: new Date("2026-02-20T10:00:00.000Z"),
    });

    expect(guess.isCorrect).toBe(true);
  });

  it("throws when required ids are empty", () => {
    expect(() =>
      TuringGuess.create({
        id: "tg-2",
        userId: "",
        dialogueSessionId: "d-1",
        guess: "ai",
        actual: "human",
        createdAt: new Date(),
      }),
    ).toThrow();
  });
});
