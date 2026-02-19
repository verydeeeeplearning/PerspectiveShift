import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { FriendshipOutput } from "../dtos/friend-output";

export interface ListFriendsDeps {
  friendshipRepository: FriendshipRepository;
}

export class ListFriendsUseCase {
  private deps: ListFriendsDeps;

  constructor(deps: ListFriendsDeps) {
    this.deps = deps;
  }

  async execute(userId: string): Promise<FriendshipOutput[]> {
    const friendships =
      await this.deps.friendshipRepository.findByUser(userId);

    return friendships
      .filter((f) => f.isActive())
      .map((f) => ({
        id: f.id,
        friendUserId:
          f.userA === userId ? f.userB : f.userA,
        status: f.status,
        dialogueCount: f.dialogueCount,
        createdAt: f.createdAt.toISOString(),
      }));
  }
}
