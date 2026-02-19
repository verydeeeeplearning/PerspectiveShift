export interface FriendRequestOutput {
  id: string;
  requesterId: string;
  targetId: string;
  status: string;
  createdAt: string;
}

export interface FriendshipOutput {
  id: string;
  friendUserId: string;
  status: string;
  dialogueCount: number;
  createdAt: string;
}

export interface RespondToFriendRequestOutput {
  requestId: string;
  status: string;
  friendshipId: string | null;
}
