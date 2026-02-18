import type { FriendRequest } from "../entities/friend-request";

export interface FriendRepository {
  save(request: FriendRequest): Promise<void>;

  findById(id: string): Promise<FriendRequest | null>;

  findPending(
    requesterId: string,
    targetId: string,
  ): Promise<FriendRequest | null>;

  findPendingForUser(userId: string): Promise<FriendRequest[]>;

  update(request: FriendRequest): Promise<void>;
}
