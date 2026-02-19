interface ReflectionQuizProps {
  options: string[];
  correctIndex: number;
  dialogueId: string;
}

export class ReflectionQuiz {
  readonly options: readonly string[];
  readonly correctIndex: number;
  readonly dialogueId: string;

  private constructor(props: ReflectionQuizProps) {
    this.options = Object.freeze([...props.options]);
    this.correctIndex = props.correctIndex;
    this.dialogueId = props.dialogueId;
  }

  static create(props: ReflectionQuizProps): ReflectionQuiz {
    if (props.options.length !== 4) {
      throw new Error("ReflectionQuiz must have exactly 4 options");
    }
    if (props.correctIndex < 0 || props.correctIndex >= props.options.length) {
      throw new Error("correctIndex out of range");
    }
    return new ReflectionQuiz(props);
  }

  isCorrect(answerIndex: number): boolean {
    return answerIndex === this.correctIndex;
  }

  get correctOptionText(): string {
    return this.options[this.correctIndex];
  }
}
