import type { TuringGuessRepository } from "@/domain/interfaces/turing-guess-repository";
import type { TuringGuess } from "@/domain/entities/turing-guess";

export class InMemoryTuringGuessRepository implements TuringGuessRepository {
  private readonly guesses: TuringGuess[] = [];

  async findByUser(userId: string): Promise<TuringGuess[]> {
    return this.guesses
      .filter((guess) => guess.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async findByUserAndSession(
    userId: string,
    dialogueSessionId: string,
  ): Promise<TuringGuess | null> {
    return (
      this.guesses.find(
        (guess) =>
          guess.userId === userId && guess.dialogueSessionId === dialogueSessionId,
      ) ?? null
    );
  }

  async save(guess: TuringGuess): Promise<void> {
    const existingIndex = this.guesses.findIndex((item) => item.id === guess.id);
    if (existingIndex >= 0) {
      this.guesses.splice(existingIndex, 1, guess);
      return;
    }
    this.guesses.push(guess);
  }
}
