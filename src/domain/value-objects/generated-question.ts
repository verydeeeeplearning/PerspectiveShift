import type { QuestionType } from "./question-type";
import type { StanceDimension } from "./stance-dimension";
import { DomainError } from "../errors/domain-errors";

export class InvalidGeneratedQuestionError extends DomainError {
  constructor(detail: string) {
    super(`Invalid generated question: ${detail}`);
  }
}

export interface GeneratedQuestionProps {
  index: number;
  batchIndex: number;
  text: string;
  type: QuestionType;
  dimension: StanceDimension;
  polarity: 1 | -1;
}

export class GeneratedQuestion {
  readonly id: string;
  readonly text: string;
  readonly type: QuestionType;
  readonly dimension: StanceDimension;
  readonly polarity: 1 | -1;
  readonly batchIndex: number;

  private constructor(props: GeneratedQuestionProps) {
    this.id = `gen-${props.batchIndex}-${props.index}`;
    this.text = props.text;
    this.type = props.type;
    this.dimension = props.dimension;
    this.polarity = props.polarity;
    this.batchIndex = props.batchIndex;
  }

  static create(props: GeneratedQuestionProps): GeneratedQuestion {
    if (!props.text || props.text.trim() === "") {
      throw new InvalidGeneratedQuestionError("Question text cannot be empty");
    }
    if (props.batchIndex < 0 || !Number.isInteger(props.batchIndex)) {
      throw new InvalidGeneratedQuestionError(
        `Batch index must be a non-negative integer, got ${props.batchIndex}`,
      );
    }
    if (props.index < 0 || !Number.isInteger(props.index)) {
      throw new InvalidGeneratedQuestionError(
        `Index must be a non-negative integer, got ${props.index}`,
      );
    }
    return new GeneratedQuestion(props);
  }
}
