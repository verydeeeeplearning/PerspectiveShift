import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import {
  FriendshipNotFoundError,
  FriendshipNotActiveError,
  UnauthorizedParticipantError,
} from "@/domain/errors/domain-errors";

export interface UnfriendDeps {
  friendshipRepository: FriendshipRepository;
}

export class UnfriendUseCase {
  private deps: UnfriendDeps;

  constructor(deps: UnfriendDeps) {
    this.deps = deps;
  }

  async execute(
    friendshipId: string,
    userId: string,
  ): Promise<void> {
    const friendship =
      await this.deps.friendshipRepository.findById(friendshipId);

    if (!friendship) {
      throw new FriendshipNotFoundError(friendshipId);
    }

    if (!friendship.isMember(userId)) {
      throw new UnauthorizedParticipantError(userId);
    }

    if (!friendship.isActive()) {
      throw new FriendshipNotActiveError(friendshipId);
    }

    friendship.unmatch();
    await this.deps.friendshipRepository.update(friendship);
  }
}
