import { InvalidRubricScoreError } from "../errors/domain-errors";

export type OxValue = boolean;
export type RubricValue = 1 | 2 | 3 | 4 | 5;
export type OpenEndedValue = string;
export type AnswerValue = OxValue | RubricValue | OpenEndedValue;

export class Answer {
  readonly questionId: number;
  readonly value: AnswerValue;
  readonly answeredAt: Date;

  private constructor(
    questionId: number,
    value: AnswerValue,
    answeredAt: Date,
  ) {
    this.questionId = questionId;
    this.value = value;
    this.answeredAt = answeredAt;
  }

  static ox(questionId: number, value: boolean): Answer {
    return new Answer(questionId, value, new Date());
  }

  static rubric(questionId: number, score: number): Answer {
    if (
      !Number.isInteger(score) ||
      score < 1 ||
      score > 5
    ) {
      throw new InvalidRubricScoreError(score);
    }
    return new Answer(questionId, score as RubricValue, new Date());
  }

  static openEnded(questionId: number, text: string): Answer {
    return new Answer(questionId, text.trim(), new Date());
  }

  isOx(): boolean {
    return typeof this.value === "boolean";
  }

  isRubric(): boolean {
    return typeof this.value === "number";
  }

  isOpenEnded(): boolean {
    return typeof this.value === "string";
  }
}
