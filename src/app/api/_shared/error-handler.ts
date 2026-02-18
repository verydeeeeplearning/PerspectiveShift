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
} from "@/domain/errors/domain-errors";

export function handleError(error: unknown): NextResponse {
  if (error instanceof UnauthorizedParticipantError) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 },
    );
  }

  if (
    error instanceof DuplicateSubmissionError ||
    error instanceof DuplicateProposalError ||
    error instanceof DuplicateFeedbackError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: 409 },
    );
  }

  if (
    error instanceof ProposalAlreadyResolvedError ||
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
