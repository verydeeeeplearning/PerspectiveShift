import type { Friendship } from "../entities/friendship";

export interface FriendshipRepository {
  findById(id: string): Promise<Friendship | null>;

  findByUsers(
    userA: string,
    userB: string,
  ): Promise<Friendship | null>;

  findByUser(userId: string): Promise<Friendship[]>;

  save(friendship: Friendship): Promise<void>;

  update(friendship: Friendship): Promise<void>;
}
