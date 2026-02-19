import { DomainError } from "../errors/domain-errors";
import type { QuestionType } from "./question-type";
import type { StanceDimension } from "./stance-dimension";

export class InvalidQuestionItemError extends DomainError {
  constructor(detail: string) {
    super(`Invalid question item: ${detail}`);
  }
}

export interface QuestionItemProps {
  id: string;
  text: string;
  type: QuestionType;
  axis: StanceDimension;
  isAnchor: boolean;
  variant?: string;
}

export class QuestionItem {
  readonly id: string;
  readonly text: string;
  readonly type: QuestionType;
  readonly axis: StanceDimension;
  readonly isAnchor: boolean;
  readonly variant?: string;

  private constructor(props: QuestionItemProps) {
    this.id = props.id;
    this.text = props.text;
    this.type = props.type;
    this.axis = props.axis;
    this.isAnchor = props.isAnchor;
    this.variant = props.variant;
  }

  static create(props: QuestionItemProps): QuestionItem {
    if (!props.id || props.id.trim() === "") {
      throw new InvalidQuestionItemError("Question ID cannot be empty");
    }
    if (!props.text || props.text.trim() === "") {
      throw new InvalidQuestionItemError("Question text cannot be empty");
    }
    return new QuestionItem(props);
  }
}
