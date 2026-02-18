import { NextResponse } from "next/server";
import {
  DomainError,
  UnauthorizedParticipantError,
  DuplicateSubmissionError,
  DuplicateProposalError,
  DuplicateFeedbackError,
  ProposalAlreadyResolvedError,
  SessionNotActiveError,
  SessionNotCompletedError,
  ExpiredSessionError,
  InvalidDialogueTransitionError,
  AuthRequiredError,
  FeatureDisabledError,
  UserNotFoundError,
  SessionAlreadyClaimedError,
  FriendRequestAlreadyExistsError,
  FriendRequestAlreadyResolvedError,
  DuplicateBlockError,
  UserBlockedError,
  FriendshipNotFoundError,
  FriendRequestNotFoundError,
  FriendshipNotActiveError,
  MeetingNotFoundError,
  MeetingAlreadyResolvedError,
  RateLimitExceededError,
} from "@/domain/errors/domain-errors";

export function handleError(error: unknown): NextResponse {
  if (error instanceof AuthRequiredError) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 },
    );
  }

  if (error instanceof FeatureDisabledError) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 },
    );
  }

  if (
    error instanceof UserBlockedError ||
    error instanceof UnauthorizedParticipantError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 },
    );
  }

  if (
    error instanceof UserNotFoundError ||
    error instanceof FriendshipNotFoundError ||
    error instanceof FriendRequestNotFoundError ||
    error instanceof MeetingNotFoundError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 },
    );
  }

  if (
    error instanceof DuplicateSubmissionError ||
    error instanceof DuplicateProposalError ||
    error instanceof DuplicateFeedbackError ||
    error instanceof FriendRequestAlreadyExistsError ||
    error instanceof SessionAlreadyClaimedError ||
    error instanceof DuplicateBlockError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: 409 },
    );
  }

  if (error instanceof RateLimitExceededError) {
    return NextResponse.json(
      { error: error.message },
      { status: 429 },
    );
  }

  if (
    error instanceof ProposalAlreadyResolvedError ||
    error instanceof FriendRequestAlreadyResolvedError ||
    error instanceof MeetingAlreadyResolvedError ||
    error instanceof FriendshipNotActiveError ||
    error instanceof SessionNotActiveError ||
    error instanceof SessionNotCompletedError ||
    error instanceof ExpiredSessionError ||
    error instanceof InvalidDialogueTransitionError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: 422 },
    );
  }

  if (error instanceof DomainError) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }

  const message =
    error instanceof Error ? error.message : "Internal server error";
  return NextResponse.json({ error: message }, { status: 500 });
}
