import type { BlockRepository } from "@/domain/interfaces/block-repository";
import type { EventTracker } from "@/domain/interfaces/event-tracker";
import { RELATIONSHIP_EVENT_TYPES } from "@/domain/value-objects/relationship-event-type";

export interface UnblockUserDeps {
  blockRepository: BlockRepository;
  eventTracker?: EventTracker;
}

export class UnblockUserUseCase {
  private deps: UnblockUserDeps;

  constructor(deps: UnblockUserDeps) {
    this.deps = deps;
  }

  async execute(
    blockerId: string,
    blockedId: string,
  ): Promise<void> {
    await this.deps.blockRepository.unblock(blockerId, blockedId);

    this.deps.eventTracker
      ?.track(RELATIONSHIP_EVENT_TYPES.USER_UNBLOCKED, blockerId, blockedId)
      .catch(() => {});
  }
}
