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

// Phase 3: Relationship errors

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User ${userId} not found`);
  }
}

export class SessionAlreadyClaimedError extends DomainError {
  constructor(sessionId: string) {
    super(`Session ${sessionId} is already claimed by another user`);
  }
}

export class FriendRequestAlreadyExistsError extends DomainError {
  constructor(requesterId: string, targetId: string) {
    super(
      `Pending friend request already exists from ${requesterId} to ${targetId}`,
    );
  }
}

export class CannotFriendSelfError extends DomainError {
  constructor() {
    super("Cannot send a friend request to yourself");
  }
}

export class UserBlockedError extends DomainError {
  constructor() {
    super("Cannot perform this action on a blocked user");
  }
}

export class InsufficientDialogueHistoryError extends DomainError {
  constructor(required: number, actual: number) {
    super(
      `At least ${required} completed dialogue(s) required, got ${actual}`,
    );
  }
}

export class FriendshipNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Friendship ${id} not found`);
  }
}

export class FriendRequestNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Friend request ${id} not found`);
  }
}

export class FriendRequestAlreadyResolvedError extends DomainError {
  constructor(id: string, status: string) {
    super(`Friend request ${id} is already ${status}`);
  }
}

export class InvalidDisclosureLevelError extends DomainError {
  constructor(current: number, requested: number) {
    super(
      `Disclosure level can only increase: current ${current}, requested ${requested}`,
    );
  }
}

export class FriendshipNotActiveError extends DomainError {
  constructor(id: string) {
    super(`Friendship ${id} is not active`);
  }
}

export class RateLimitExceededError extends DomainError {
  constructor() {
    super("Rate limit exceeded. Please try again later");
  }
}

export class InsufficientDisclosureLevelError extends DomainError {
  constructor(required: number, actual: number) {
    super(
      `Disclosure level ${required} required for this action, current level is ${actual}`,
    );
  }
}

export class DuplicateBlockError extends DomainError {
  constructor() {
    super("User is already blocked");
  }
}

export class MeetingConditionsNotMetError extends DomainError {
  constructor(reason: string) {
    super(`Offline meeting conditions not met: ${reason}`);
  }
}

export class MeetingNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Meeting proposal ${id} not found`);
  }
}

export class MeetingAlreadyResolvedError extends DomainError {
  constructor(id: string, status: string) {
    super(`Meeting proposal ${id} is already ${status}`);
  }
}

export class AuthRequiredError extends DomainError {
  constructor() {
    super("Authentication is required for this action");
  }
}

export class FeatureDisabledError extends DomainError {
  constructor(feature: string) {
    super(`Feature ${feature} is currently disabled`);
  }
}

// V2 Phase 1: Self-Affirmation errors

export class InvalidCoreValueError extends DomainError {
  constructor(value: string) {
    super(
      `Invalid core value: "${value}". Must be one of: FAIRNESS, FREEDOM, CARING, ACHIEVEMENT, SAFETY, TRUTH, RESPONSIBILITY, GROWTH`,
    );
  }
}

export class InvalidConfidenceLevelError extends DomainError {
  constructor(value: string) {
    super(
      `Invalid confidence level: "${value}". Must be one of: LOW, MEDIUM, HIGH`,
    );
  }
}
