import {
  type DialogueStep,
  nextStep,
  isFinalStep,
} from "../value-objects/dialogue-step";
import type { SessionStatus } from "../value-objects/session-status";
import type { DialogueTurn } from "./dialogue-turn";
import {
  InvalidDialogueTransitionError,
  DuplicateSubmissionError,
  UnauthorizedParticipantError,
  SessionNotActiveError,
} from "../errors/domain-errors";

const REMINDER_HOURS = 24;
const EXPIRATION_HOURS = 48;

export interface DialogueSessionProps {
  id: string;
  participantA: string;
  participantB: string;
  currentStep: DialogueStep;
  status: SessionStatus;
  turns: DialogueTurn[];
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}

export class DialogueSession {
  readonly id: string;
  readonly participantA: string;
  readonly participantB: string;
  private _currentStep: DialogueStep;
  private _status: SessionStatus;
  private _turns: DialogueTurn[];
  readonly createdAt: Date;
  private _updatedAt: Date;
  private _lastActivityAt: Date;

  private constructor(props: DialogueSessionProps) {
    this.id = props.id;
    this.participantA = props.participantA;
    this.participantB = props.participantB;
    this._currentStep = props.currentStep;
    this._status = props.status;
    this._turns = [...props.turns];
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._lastActivityAt = props.lastActivityAt;
  }

  get currentStep(): DialogueStep {
    return this._currentStep;
  }

  get status(): SessionStatus {
    return this._status;
  }

  get turns(): ReadonlyArray<DialogueTurn> {
    return this._turns;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get lastActivityAt(): Date {
    return this._lastActivityAt;
  }

  static create(
    props: Omit<DialogueSessionProps, "turns">,
  ): DialogueSession {
    return new DialogueSession({ ...props, turns: [] });
  }

  static reconstitute(
    props: DialogueSessionProps,
  ): DialogueSession {
    return new DialogueSession(props);
  }

  isParticipant(sessionId: string): boolean {
    return (
      sessionId === this.participantA ||
      sessionId === this.participantB
    );
  }

  submitTurn(turn: DialogueTurn): void {
    this.ensureActive();
    this.ensureParticipant(turn.participantId);
    this.ensureCorrectStep(turn.step);
    this.ensureNoDuplicate(turn.participantId, turn.step);

    this._turns.push(turn);
    this._lastActivityAt = turn.createdAt;
    this._updatedAt = turn.createdAt;

    if (this.bothSubmitted(turn.step)) {
      this.advance();
    }
  }

  needsReminder(now: Date): boolean {
    if (this._status !== "ACTIVE") return false;
    const elapsed =
      (now.getTime() - this._lastActivityAt.getTime()) / 3600000;
    return elapsed >= REMINDER_HOURS && elapsed < EXPIRATION_HOURS;
  }

  shouldExpire(now: Date): boolean {
    if (this._status !== "ACTIVE") return false;
    const elapsed =
      (now.getTime() - this._lastActivityAt.getTime()) / 3600000;
    return elapsed >= EXPIRATION_HOURS;
  }

  markExpired(): void {
    this._status = "EXPIRED";
    this._updatedAt = new Date();
  }

  cancel(): void {
    this.ensureActive();
    this._status = "CANCELLED";
    this._updatedAt = new Date();
  }

  turnsForStep(step: DialogueStep): DialogueTurn[] {
    return this._turns.filter((t) => t.step === step);
  }

  hasSubmitted(participantId: string, step: DialogueStep): boolean {
    return this._turns.some(
      (t) =>
        t.participantId === participantId && t.step === step,
    );
  }

  isComplete(): boolean {
    return this._status === "COMPLETED";
  }

  private bothSubmitted(step: DialogueStep): boolean {
    const submissions = this.turnsForStep(step);
    const participants = new Set(submissions.map((t) => t.participantId));
    return participants.size === 2;
  }

  private advance(): void {
    if (isFinalStep(this._currentStep)) {
      this._status = "COMPLETED";
      this._updatedAt = new Date();
      return;
    }
    const next = nextStep(this._currentStep);
    if (next) {
      this._currentStep = next;
      this._updatedAt = new Date();
    }
  }

  private ensureActive(): void {
    if (this._status !== "ACTIVE") {
      throw new SessionNotActiveError(this.id, this._status);
    }
  }

  private ensureParticipant(participantId: string): void {
    if (!this.isParticipant(participantId)) {
      throw new UnauthorizedParticipantError(participantId);
    }
  }

  private ensureCorrectStep(step: DialogueStep): void {
    if (step !== this._currentStep) {
      throw new InvalidDialogueTransitionError(
        this._currentStep,
        step,
      );
    }
  }

  private ensureNoDuplicate(
    participantId: string,
    step: DialogueStep,
  ): void {
    if (this.hasSubmitted(participantId, step)) {
      throw new DuplicateSubmissionError(participantId, step);
    }
  }
}
