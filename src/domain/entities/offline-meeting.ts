import type { MeetingStatus } from "../value-objects/meeting-status";
import type { SafetyCheckinStatus } from "../value-objects/safety-checkin-status";
import { MeetingAlreadyResolvedError } from "../errors/domain-errors";

export interface OfflineMeetingProps {
  id: string;
  friendshipId: string;
  proposerId: string;
  status: MeetingStatus;
  safetyCheckinStatus: SafetyCheckinStatus;
  proposedAt: Date | null;
  locationHint: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class OfflineMeeting {
  readonly id: string;
  readonly friendshipId: string;
  readonly proposerId: string;
  private _status: MeetingStatus;
  private _safetyCheckinStatus: SafetyCheckinStatus;
  readonly proposedAt: Date | null;
  readonly locationHint: string | null;
  readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: OfflineMeetingProps) {
    this.id = props.id;
    this.friendshipId = props.friendshipId;
    this.proposerId = props.proposerId;
    this._status = props.status;
    this._safetyCheckinStatus = props.safetyCheckinStatus;
    this.proposedAt = props.proposedAt;
    this.locationHint = props.locationHint;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get status(): MeetingStatus {
    return this._status;
  }

  get safetyCheckinStatus(): SafetyCheckinStatus {
    return this._safetyCheckinStatus;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(props: OfflineMeetingProps): OfflineMeeting {
    return new OfflineMeeting(props);
  }

  confirm(): void {
    this.ensureProposed();
    this._status = "CONFIRMED";
    this._updatedAt = new Date();
  }

  cancel(): void {
    if (this._status !== "PROPOSED" && this._status !== "CONFIRMED") {
      throw new MeetingAlreadyResolvedError(this.id, this._status);
    }
    this._status = "CANCELLED";
    this._updatedAt = new Date();
  }

  complete(): void {
    if (this._status !== "CONFIRMED") {
      throw new MeetingAlreadyResolvedError(this.id, this._status);
    }
    this._status = "COMPLETED";
    this._updatedAt = new Date();
  }

  submitCheckin(checkinStatus: SafetyCheckinStatus): void {
    this._safetyCheckinStatus = checkinStatus;
    this._updatedAt = new Date();
  }

  private ensureProposed(): void {
    if (this._status !== "PROPOSED") {
      throw new MeetingAlreadyResolvedError(this.id, this._status);
    }
  }
}
