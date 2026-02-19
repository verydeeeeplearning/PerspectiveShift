import { TuringGuess, type TuringSide } from "@/domain/entities/turing-guess";
import type { TuringGuessRepository } from "@/domain/interfaces/turing-guess-repository";
import {
  evaluateTuringRewards,
  type TuringReward,
} from "@/domain/value-objects/turing-reward";

export interface SubmitTuringGuessInput {
  userId: string;
  dialogueSessionId: string;
  guess: TuringSide;
}

export interface SubmitTuringGuessOutput {
  guessId: string;
  actual: TuringSide;
  isCorrect: boolean;
  streak: number;
  badgeIncrement: number;
  rewards: Array<{ type: string; message: string }>;
  events: string[];
}

export interface SubmitTuringGuessDeps {
  turingGuessRepository: TuringGuessRepository;
  resolveActualSpeaker: (dialogueSessionId: string) => Promise<TuringSide>;
}

export class SubmitTuringGuessUseCase {
  constructor(private readonly deps: SubmitTuringGuessDeps) {}

  async execute(input: SubmitTuringGuessInput): Promise<SubmitTuringGuessOutput> {
    const existing = await this.deps.turingGuessRepository.findByUserAndSession(
      input.userId,
      input.dialogueSessionId,
    );
    if (existing) {
      throw new Error("Turing guess already submitted for this session");
    }

    const actual = await this.deps.resolveActualSpeaker(input.dialogueSessionId);
    const guess = TuringGuess.create({
      id: crypto.randomUUID(),
      userId: input.userId,
      dialogueSessionId: input.dialogueSessionId,
      guess: input.guess,
      actual,
      createdAt: new Date(),
    });

    const history = await this.deps.turingGuessRepository.findByUser(input.userId);
    const streak = this.calculateStreak([...history, guess]);
    const rewards = evaluateTuringRewards({
      isCorrect: guess.isCorrect,
      guess: guess.guess,
      actual: guess.actual,
      streak,
    });

    await this.deps.turingGuessRepository.save(guess);

    return {
      guessId: guess.id,
      actual: guess.actual,
      isCorrect: guess.isCorrect,
      streak,
      badgeIncrement: guess.isCorrect ? 1 : 0,
      rewards: rewards.map((reward) => ({
        type: reward.type,
        message: reward.message,
      })),
      events: this.buildEvents(input.guess, guess.isCorrect, rewards),
    };
  }

  private calculateStreak(guesses: TuringGuess[]): number {
    let streak = 0;
    for (let i = guesses.length - 1; i >= 0; i -= 1) {
      if (!guesses[i].isCorrect) {
        break;
      }
      streak += 1;
    }
    return streak;
  }

  private buildEvents(
    guess: TuringSide,
    isCorrect: boolean,
    rewards: TuringReward[],
  ): string[] {
    const events = [`turing_guess_${guess}`];
    if (isCorrect) {
      events.push("turing_correct");
    }
    if (rewards.length > 0) {
      events.push("turing_badge_earned");
    }
    return events;
  }
}
