import type { FriendRequestStatus } from "../value-objects/friend-request-status";
import { FriendRequestAlreadyResolvedError } from "../errors/domain-errors";

export interface FriendRequestProps {
  id: string;
  requesterId: string;
  targetId: string;
  dialogueSessionId: string | null;
  status: FriendRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class FriendRequest {
  readonly id: string;
  readonly requesterId: string;
  readonly targetId: string;
  readonly dialogueSessionId: string | null;
  private _status: FriendRequestStatus;
  readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: FriendRequestProps) {
    this.id = props.id;
    this.requesterId = props.requesterId;
    this.targetId = props.targetId;
    this.dialogueSessionId = props.dialogueSessionId;
    this._status = props.status;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get status(): FriendRequestStatus {
    return this._status;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(props: FriendRequestProps): FriendRequest {
    return new FriendRequest(props);
  }

  accept(): void {
    this.ensurePending();
    this._status = "ACCEPTED";
    this._updatedAt = new Date();
  }

  decline(): void {
    this.ensurePending();
    this._status = "DECLINED";
    this._updatedAt = new Date();
  }

  silentReject(): void {
    this.ensurePending();
    this._status = "SILENT_REJECTED";
    this._updatedAt = new Date();
  }

  isPending(): boolean {
    return this._status === "PENDING";
  }

  private ensurePending(): void {
    if (this._status !== "PENDING") {
      throw new FriendRequestAlreadyResolvedError(this.id, this._status);
    }
  }
}
