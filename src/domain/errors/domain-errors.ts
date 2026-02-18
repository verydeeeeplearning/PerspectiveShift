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

export class InvalidOpinionDistanceError extends DomainError {
  constructor(value: number) {
    super(
      `Opinion distance must be between 0 and 2, got ${value}`,
    );
  }
}

export class InvalidReadinessScoreError extends DomainError {
  constructor(value: number) {
    super(
      `Readiness score must be between 0 and 1, got ${value}`,
    );
  }
}

export class InvalidDialogueTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(
      `Invalid dialogue transition from ${from} to ${to}`,
    );
  }
}

export class DuplicateSubmissionError extends DomainError {
  constructor(participantId: string, step: string) {
    super(
      `Participant ${participantId} already submitted for step ${step}`,
    );
  }
}

export class UnauthorizedParticipantError extends DomainError {
  constructor(participantId: string) {
    super(
      `Participant ${participantId} is not part of this dialogue`,
    );
  }
}

export class ExpiredSessionError extends DomainError {
  constructor(sessionId: string) {
    super(`Dialogue session ${sessionId} has expired`);
  }
}

export class SessionNotActiveError extends DomainError {
  constructor(sessionId: string, status: string) {
    super(
      `Dialogue session ${sessionId} is ${status}, not ACTIVE`,
    );
  }
}

export class ProposalAlreadyResolvedError extends DomainError {
  constructor(proposalId: string, status: string) {
    super(
      `Match proposal ${proposalId} is already ${status}`,
    );
  }
}

export class DuplicateProposalError extends DomainError {
  constructor(initiatorId: string, targetId: string) {
    super(
      `Pending proposal already exists between ${initiatorId} and ${targetId}`,
    );
  }
}

export class SessionNotCompletedError extends DomainError {
  constructor(sessionId: string) {
    super(
      `Dialogue session ${sessionId} must be completed before this action`,
    );
  }
}

export class DuplicateFeedbackError extends DomainError {
  constructor(sessionId: string, participantId: string) {
    super(
      `Feedback already submitted for session ${sessionId} by ${participantId}`,
    );
  }
}
