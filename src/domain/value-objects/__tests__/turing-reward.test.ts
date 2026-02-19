import { describe, it, expect } from "vitest";
import { evaluateTuringRewards } from "../turing-reward";

describe("evaluateTuringRewards", () => {
  it("gives observer rewards for correct answer", () => {
    const rewards = evaluateTuringRewards({
      isCorrect: true,
      guess: "human",
      actual: "human",
      streak: 3,
    });

    expect(rewards.map((reward) => reward.type)).toEqual([
      "observer_badge",
      "sharp_observer",
    ]);
  });

  it("gives impressive_view when AI is mistaken as human", () => {
    const rewards = evaluateTuringRewards({
      isCorrect: false,
      guess: "human",
      actual: "ai",
      streak: 0,
    });

    expect(rewards[0]?.type).toBe("impressive_view");
  });
});
