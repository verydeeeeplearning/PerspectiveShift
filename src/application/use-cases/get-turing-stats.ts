import type { TuringGuessRepository } from "@/domain/interfaces/turing-guess-repository";

interface GetTuringStatsInput {
  userId: string;
}

interface TuringStatsResult {
  totalGuesses: number;
  correctGuesses: number;
  accuracy: number;
  streak: number;
  badges: {
    observerBadge: number;
    sharpObserver: number;
    impressiveView: number;
    unexpectedView: number;
  };
}

export class GetTuringStatsUseCase {
  constructor(
    private readonly turingGuessRepository: TuringGuessRepository,
  ) {}

  async execute(input: GetTuringStatsInput): Promise<TuringStatsResult> {
    const guesses = await this.turingGuessRepository.findByUser(input.userId);
    const totalGuesses = guesses.length;
    const correctGuesses = guesses.filter((guess) => guess.isCorrect).length;
    const streak = this.calculateStreak(guesses.map((guess) => guess.isCorrect));
    const sharpObserver = this.calculateSharpObserverCount(
      guesses.map((guess) => guess.isCorrect),
    );

    const impressiveView = guesses.filter(
      (guess) => !guess.isCorrect && guess.guess === "human" && guess.actual === "ai",
    ).length;
    const unexpectedView = guesses.filter(
      (guess) => !guess.isCorrect && guess.guess === "ai" && guess.actual === "human",
    ).length;

    return {
      totalGuesses,
      correctGuesses,
      accuracy: totalGuesses > 0 ? Math.round((correctGuesses / totalGuesses) * 100) : 0,
      streak,
      badges: {
        observerBadge: correctGuesses,
        sharpObserver,
        impressiveView,
        unexpectedView,
      },
    };
  }

  private calculateStreak(results: boolean[]): number {
    let streak = 0;
    for (let i = results.length - 1; i >= 0; i -= 1) {
      if (!results[i]) break;
      streak += 1;
    }
    return streak;
  }

  private calculateSharpObserverCount(results: boolean[]): number {
    if (results.length < 3) return 0;
    let running = 0;
    let count = 0;
    for (const result of results) {
      if (result) {
        running += 1;
        if (running === 3) {
          count += 1;
        }
      } else {
        running = 0;
      }
    }
    return count;
  }
}
