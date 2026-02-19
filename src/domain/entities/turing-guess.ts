export type TuringSide = "human" | "ai";

export interface TuringGuessProps {
  id: string;
  userId: string;
  dialogueSessionId: string;
  guess: TuringSide;
  actual: TuringSide;
  createdAt: Date;
}

export class TuringGuess {
  readonly id: string;
  readonly userId: string;
  readonly dialogueSessionId: string;
  readonly guess: TuringSide;
  readonly actual: TuringSide;
  readonly isCorrect: boolean;
  readonly createdAt: Date;

  private constructor(props: TuringGuessProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.dialogueSessionId = props.dialogueSessionId;
    this.guess = props.guess;
    this.actual = props.actual;
    this.isCorrect = props.guess === props.actual;
    this.createdAt = props.createdAt;
  }

  static create(props: TuringGuessProps): TuringGuess {
    if (!props.userId.trim()) {
      throw new Error("TuringGuess userId must not be empty");
    }
    if (!props.dialogueSessionId.trim()) {
      throw new Error("TuringGuess dialogueSessionId must not be empty");
    }
    return new TuringGuess(props);
  }
}
