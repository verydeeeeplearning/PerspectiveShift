export interface UserProfileOutput {
  userId: string;
  displayAlias: string;
  claimedSessionIds: string[];
  createdAt: string;
}

export interface ClaimSessionOutput {
  userId: string;
  sessionId: string;
  alreadyClaimed: boolean;
}
