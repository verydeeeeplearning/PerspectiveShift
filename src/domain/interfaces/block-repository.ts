export interface BlockRepository {
  isBlocked(
    blockerId: string,
    blockedId: string,
  ): Promise<boolean>;

  isBlockedEitherDirection(
    userId1: string,
    userId2: string,
  ): Promise<boolean>;

  block(blockerId: string, blockedId: string): Promise<void>;

  unblock(blockerId: string, blockedId: string): Promise<void>;
}
