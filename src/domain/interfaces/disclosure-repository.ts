import type { DisclosureSetting } from "../entities/disclosure-setting";

export interface DisclosureRepository {
  findByFriendship(friendshipId: string): Promise<DisclosureSetting[]>;

  findByDirection(
    friendshipId: string,
    fromUserId: string,
    toUserId: string,
  ): Promise<DisclosureSetting | null>;

  save(setting: DisclosureSetting): Promise<void>;

  update(setting: DisclosureSetting): Promise<void>;
}
