import type { QuestionType } from "../value-objects/question-type";
import type { StanceDimension } from "../value-objects/stance-dimension";
import { InvalidQuestionIdError } from "../errors/domain-errors";

export interface QuestionProps {
  id: number;
  text: string;
  type: QuestionType;
  dimension: StanceDimension;
  phase: "core" | "extended";
  polarity: 1 | -1;
}

export class Question {
  readonly id: number;
  readonly text: string;
  readonly type: QuestionType;
  readonly dimension: StanceDimension;
  readonly phase: "core" | "extended";
  readonly polarity: 1 | -1;

  private constructor(props: QuestionProps) {
    this.id = props.id;
    this.text = props.text;
    this.type = props.type;
    this.dimension = props.dimension;
    this.phase = props.phase;
    this.polarity = props.polarity;
  }

  static create(props: QuestionProps): Question {
    if (props.id < 1 || props.id > 999 || !Number.isInteger(props.id)) {
      throw new InvalidQuestionIdError(props.id);
    }
    return new Question(props);
  }

  isCore(): boolean {
    return this.phase === "core";
  }

  isExtended(): boolean {
    return this.phase === "extended";
  }
}
