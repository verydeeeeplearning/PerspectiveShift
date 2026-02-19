import type { LightProtocolType } from "../value-objects/light-protocol-type";

export type LightProtocolStatus = "ACTIVE" | "COMPLETED" | "EXPIRED";

export type ProtocolResponseData = Record<string, string>;

export interface LightProtocolSessionProps {
  id: string;
  friendshipId: string;
  type: LightProtocolType;
  initiatorId: string;
  status: LightProtocolStatus;
  initiatorResponse: ProtocolResponseData | null;
  responderResponse: ProtocolResponseData | null;
  createdAt: Date;
  completedAt: Date | null;
}

const EXPIRY_HOURS = 24;

export class LightProtocolSession {
  readonly id: string;
  readonly friendshipId: string;
  readonly type: LightProtocolType;
  readonly initiatorId: string;
  private _status: LightProtocolStatus;
  private _initiatorResponse: ProtocolResponseData | null;
  private _responderResponse: ProtocolResponseData | null;
  readonly createdAt: Date;
  private _completedAt: Date | null;

  private constructor(props: LightProtocolSessionProps) {
    this.id = props.id;
    this.friendshipId = props.friendshipId;
    this.type = props.type;
    this.initiatorId = props.initiatorId;
    this._status = props.status;
    this._initiatorResponse = props.initiatorResponse;
    this._responderResponse = props.responderResponse;
    this.createdAt = props.createdAt;
    this._completedAt = props.completedAt;
  }

  get status(): LightProtocolStatus {
    return this._status;
  }

  get initiatorResponse(): ProtocolResponseData | null {
    return this._initiatorResponse;
  }

  get responderResponse(): ProtocolResponseData | null {
    return this._responderResponse;
  }

  get completedAt(): Date | null {
    return this._completedAt;
  }

  static create(
    props: Omit<
      LightProtocolSessionProps,
      "status" | "initiatorResponse" | "responderResponse" | "completedAt"
    >,
  ): LightProtocolSession {
    return new LightProtocolSession({
      ...props,
      status: "ACTIVE",
      initiatorResponse: null,
      responderResponse: null,
      completedAt: null,
    });
  }

  static reconstitute(
    props: LightProtocolSessionProps,
  ): LightProtocolSession {
    return new LightProtocolSession(props);
  }

  submitInitiatorResponse(data: ProtocolResponseData): void {
    if (this._status !== "ACTIVE") {
      throw new Error("Session is not active");
    }
    this._initiatorResponse = data;
    this.tryComplete();
  }

  submitResponderResponse(data: ProtocolResponseData): void {
    if (this._status !== "ACTIVE") {
      throw new Error("Session is not active");
    }
    this._responderResponse = data;
    this.tryComplete();
  }

  isExpired(now: Date = new Date()): boolean {
    const expiryTime = new Date(
      this.createdAt.getTime() + EXPIRY_HOURS * 60 * 60 * 1000,
    );
    return now >= expiryTime && this._status === "ACTIVE";
  }

  expire(): void {
    if (this._status === "ACTIVE") {
      this._status = "EXPIRED";
    }
  }

  isCompleted(): boolean {
    return this._status === "COMPLETED";
  }

  private tryComplete(): void {
    if (this._initiatorResponse && this._responderResponse) {
      this._status = "COMPLETED";
      this._completedAt = new Date();
    }
  }
}
