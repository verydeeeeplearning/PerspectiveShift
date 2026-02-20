import { describe, it, expect } from "vitest";
import { evaluateTuringRewards } from "../turing-reward";

describe("evaluateTuringRewards", () => {
  it("returns correct_ai reward when guessed ai correctly", () => {
    const rewards = evaluateTuringRewards({
      isCorrect: true,
      guess: "ai",
      actual: "ai",
      streak: 1,
    });

    expect(rewards.map((reward) => reward.type)).toEqual(["correct_ai"]);
  });

  it("returns correct_human reward when guessed human correctly", () => {
    const rewards = evaluateTuringRewards({
      isCorrect: true,
      guess: "human",
      actual: "human",
      streak: 1,
    });

    expect(rewards.map((reward) => reward.type)).toEqual(["correct_human"]);
  });

  it("adds streak_3 when streak reaches 3", () => {
    const rewards = evaluateTuringRewards({
      isCorrect: true,
      guess: "human",
      actual: "human",
      streak: 3,
    });

    expect(rewards.map((reward) => reward.type)).toEqual([
      "correct_human",
      "streak_3",
    ]);
  });

  it("returns wrong_human_for_ai when AI is mistaken as human", () => {
    const rewards = evaluateTuringRewards({
      isCorrect: false,
      guess: "human",
      actual: "ai",
      streak: 0,
    });

    expect(rewards.map((reward) => reward.type)).toEqual([
      "wrong_human_for_ai",
    ]);
  });

  it("returns wrong_ai_for_human when human is mistaken as AI", () => {
    const rewards = evaluateTuringRewards({
      isCorrect: false,
      guess: "ai",
      actual: "human",
      streak: 0,
    });

    expect(rewards.map((reward) => reward.type)).toEqual([
      "wrong_ai_for_human",
    ]);
  });
});
