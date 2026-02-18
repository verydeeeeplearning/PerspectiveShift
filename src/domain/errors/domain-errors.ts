export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidStanceAxisError extends DomainError {
  constructor(value: number) {
    super(
      `Stance axis value must be between -1.0 and 1.0, got ${value}`,
    );
  }
}

export class InvalidQuestionIdError extends DomainError {
  constructor(id: number) {
    super(`Question ID must be between 1 and 10, got ${id}`);
  }
}

export class InvalidRubricScoreError extends DomainError {
  constructor(score: number) {
    super(`Rubric score must be between 1 and 5, got ${score}`);
  }
}

export class IncompleteStanceVectorError extends DomainError {
  constructor(missing: string[]) {
    super(
      `Stance vector is missing dimensions: ${missing.join(", ")}`,
    );
  }
}

export class InsufficientAnswersError extends DomainError {
  constructor(required: number, got: number) {
    super(
      `At least ${required} answers required, got ${got}`,
    );
  }
}
