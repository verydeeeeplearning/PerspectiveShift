import type { TuringGuess } from "@/domain/entities/turing-guess";

export interface TuringGuessRepository {
  findByUser(userId: string): Promise<TuringGuess[]>;
  findByUserAndSession(
    userId: string,
    dialogueSessionId: string,
  ): Promise<TuringGuess | null>;
  save(guess: TuringGuess): Promise<void>;
}
