import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubmitTuringGuessUseCase } from "../submit-turing-guess";
import type { TuringGuessRepository } from "@/domain/interfaces/turing-guess-repository";
import type { TuringGuess } from "@/domain/entities/turing-guess";

describe("SubmitTuringGuessUseCase", () => {
  let saved: TuringGuess[] = [];
  let repository: TuringGuessRepository;

  beforeEach(() => {
    saved = [];
    repository = {
      findByUser: vi.fn(async (userId: string) => saved.filter((guess) => guess.userId === userId)),
      findByUserAndSession: vi.fn(async (userId: string, dialogueSessionId: string) =>
        saved.find(
          (guess) =>
            guess.userId === userId && guess.dialogueSessionId === dialogueSessionId,
        ) ?? null,
      ),
      save: vi.fn(async (guess: TuringGuess) => {
        saved.push(guess);
      }),
    };
  });

  it("creates guess and returns reward payload", async () => {
    const uc = new SubmitTuringGuessUseCase({
      turingGuessRepository: repository,
      resolveActualSpeaker: vi.fn().mockResolvedValue("ai"),
    });

    const result = await uc.execute({
      userId: "u-1",
      dialogueSessionId: "d-1",
      guess: "human",
    });

    expect(result.isCorrect).toBe(false);
    expect(result.rewards[0]?.type).toBe("impressive_view");
    expect(result.events).toContain("turing_guess_human");
    expect(result.events).toContain("turing_badge_earned");
  });

  it("throws when same session is submitted twice", async () => {
    const uc = new SubmitTuringGuessUseCase({
      turingGuessRepository: repository,
      resolveActualSpeaker: vi.fn().mockResolvedValue("human"),
    });

    await uc.execute({
      userId: "u-1",
      dialogueSessionId: "d-1",
      guess: "human",
    });

    await expect(
      uc.execute({
        userId: "u-1",
        dialogueSessionId: "d-1",
        guess: "ai",
      }),
    ).rejects.toThrow("already submitted");
  });
});
