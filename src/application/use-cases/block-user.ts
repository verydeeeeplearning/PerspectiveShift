import type { BlockRepository } from "@/domain/interfaces/block-repository";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { EventTracker } from "@/domain/interfaces/event-tracker";
import { RELATIONSHIP_EVENT_TYPES } from "@/domain/value-objects/relationship-event-type";
import { DuplicateBlockError } from "@/domain/errors/domain-errors";

export interface BlockUserDeps {
  blockRepository: BlockRepository;
  friendshipRepository: FriendshipRepository;
  eventTracker?: EventTracker;
}

export class BlockUserUseCase {
  private deps: BlockUserDeps;

  constructor(deps: BlockUserDeps) {
    this.deps = deps;
  }

  async execute(
    blockerId: string,
    blockedId: string,
  ): Promise<void> {
    const alreadyBlocked = await this.deps.blockRepository.isBlocked(
      blockerId,
      blockedId,
    );
    if (alreadyBlocked) {
      throw new DuplicateBlockError();
    }

    await this.deps.blockRepository.block(blockerId, blockedId);

    const friendship =
      await this.deps.friendshipRepository.findByUsers(
        blockerId,
        blockedId,
      );
    if (friendship && friendship.isActive()) {
      friendship.block();
      await this.deps.friendshipRepository.update(friendship);
    }

    this.deps.eventTracker
      ?.track(RELATIONSHIP_EVENT_TYPES.USER_BLOCKED, blockerId, blockedId)
      .catch(() => {});
  }
}
