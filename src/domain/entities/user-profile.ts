export interface UserProfileProps {
  userId: string;
  displayAlias: string;
  claimedSessionIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class UserProfile {
  readonly userId: string;
  readonly displayAlias: string;
  private _claimedSessionIds: string[];
  readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: UserProfileProps) {
    this.userId = props.userId;
    this.displayAlias = props.displayAlias;
    this._claimedSessionIds = [...props.claimedSessionIds];
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get claimedSessionIds(): ReadonlyArray<string> {
    return [...this._claimedSessionIds];
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(props: UserProfileProps): UserProfile {
    return new UserProfile(props);
  }

  hasClaimedSession(sessionId: string): boolean {
    return this._claimedSessionIds.includes(sessionId);
  }

  claimSession(sessionId: string): void {
    if (this.hasClaimedSession(sessionId)) return;
    this._claimedSessionIds.push(sessionId);
    this._updatedAt = new Date();
  }
}
