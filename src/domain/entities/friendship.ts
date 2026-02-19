import type { FriendshipStatus } from "../value-objects/friendship-status";

export interface FriendshipProps {
  id: string;
  userA: string;
  userB: string;
  status: FriendshipStatus;
  dialogueCount: number;
  completedLightProtocols?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Friendship {
  readonly id: string;
  readonly userA: string;
  readonly userB: string;
  private _status: FriendshipStatus;
  private _dialogueCount: number;
  private _completedLightProtocols: number;
  readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: FriendshipProps) {
    this.id = props.id;
    this.userA = props.userA;
    this.userB = props.userB;
    this._status = props.status;
    this._dialogueCount = props.dialogueCount;
    this._completedLightProtocols = props.completedLightProtocols ?? 0;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get status(): FriendshipStatus {
    return this._status;
  }

  get dialogueCount(): number {
    return this._dialogueCount;
  }

  get completedLightProtocols(): number {
    return this._completedLightProtocols;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(props: FriendshipProps): Friendship {
    return new Friendship(props);
  }

  static normalizePair(
    id1: string,
    id2: string,
  ): [string, string] {
    return id1 < id2 ? [id1, id2] : [id2, id1];
  }

  isMember(userId: string): boolean {
    return userId === this.userA || userId === this.userB;
  }

  isActive(): boolean {
    return this._status === "ACTIVE";
  }

  block(): void {
    this._status = "BLOCKED";
    this._updatedAt = new Date();
  }

  unmatch(): void {
    this._status = "UNMATCHED";
    this._updatedAt = new Date();
  }

  incrementDialogueCount(): void {
    this._dialogueCount++;
    this._updatedAt = new Date();
  }

  incrementLightProtocolCount(): void {
    this._completedLightProtocols++;
    this._updatedAt = new Date();
  }

  isRealtimeEligible(): boolean {
    return (
      this._status === "ACTIVE" &&
      this._dialogueCount >= 2 &&
      this._completedLightProtocols >= 1
    );
  }

  meetsRealtimeThreshold(): boolean {
    return this._status === "ACTIVE";
  }

  meetsOfflineThreshold(disclosureLevel: number): boolean {
    return this._dialogueCount >= 3 && disclosureLevel >= 2;
  }
}
