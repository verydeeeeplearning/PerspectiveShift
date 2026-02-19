import { describe, it, expect } from "vitest";
import { GetTuringStatsUseCase } from "../get-turing-stats";
import { TuringGuess } from "@/domain/entities/turing-guess";

describe("GetTuringStatsUseCase", () => {
  it("returns aggregated stats", async () => {
    const now = new Date("2026-02-20T10:00:00.000Z");
    const guesses = [
      TuringGuess.create({
        id: "1",
        userId: "u-1",
        dialogueSessionId: "d-1",
        guess: "human",
        actual: "human",
        createdAt: now,
      }),
      TuringGuess.create({
        id: "2",
        userId: "u-1",
        dialogueSessionId: "d-2",
        guess: "ai",
        actual: "human",
        createdAt: now,
      }),
      TuringGuess.create({
        id: "3",
        userId: "u-1",
        dialogueSessionId: "d-3",
        guess: "ai",
        actual: "ai",
        createdAt: now,
      }),
    ];

    const uc = new GetTuringStatsUseCase({
      findByUser: async () => guesses,
      findByUserAndSession: async () => null,
      save: async () => {},
    });

    const result = await uc.execute({ userId: "u-1" });

    expect(result.totalGuesses).toBe(3);
    expect(result.correctGuesses).toBe(2);
    expect(result.accuracy).toBe(67);
    expect(result.badges.observerBadge).toBe(2);
    expect(result.badges.unexpectedView).toBe(1);
  });
});
