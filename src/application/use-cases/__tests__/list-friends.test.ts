import { describe, it, expect, vi } from "vitest";
import { ListFriendsUseCase } from "../list-friends";
import { Friendship } from "@/domain/entities/friendship";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";

function makeFriendship(
  id: string,
  userA: string,
  userB: string,
  status: "ACTIVE" | "UNMATCHED" | "BLOCKED" = "ACTIVE",
) {
  return Friendship.create({
    id,
    userA,
    userB,
    status,
    dialogueCount: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe("ListFriendsUseCase", () => {
  it("returns active friendships for user", async () => {
    const repo: FriendshipRepository = {
      findById: vi.fn(),
      findByUsers: vi.fn(),
      findByUser: vi.fn().mockResolvedValue([
        makeFriendship("f1", "aaa", "bbb"),
        makeFriendship("f2", "aaa", "ccc", "BLOCKED"),
      ]),
      save: vi.fn(),
      update: vi.fn(),
    };

    const uc = new ListFriendsUseCase({ friendshipRepository: repo });
    const result = await uc.execute("aaa");

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("f1");
    expect(result[0].friendUserId).toBe("bbb");
  });

  it("resolves friendUserId correctly when user is userB", async () => {
    const repo: FriendshipRepository = {
      findById: vi.fn(),
      findByUsers: vi.fn(),
      findByUser: vi.fn().mockResolvedValue([
        makeFriendship("f1", "aaa", "bbb"),
      ]),
      save: vi.fn(),
      update: vi.fn(),
    };

    const uc = new ListFriendsUseCase({ friendshipRepository: repo });
    const result = await uc.execute("bbb");

    expect(result[0].friendUserId).toBe("aaa");
  });

  it("returns empty array when no friends", async () => {
    const repo: FriendshipRepository = {
      findById: vi.fn(),
      findByUsers: vi.fn(),
      findByUser: vi.fn().mockResolvedValue([]),
      save: vi.fn(),
      update: vi.fn(),
    };

    const uc = new ListFriendsUseCase({ friendshipRepository: repo });
    const result = await uc.execute("aaa");

    expect(result).toEqual([]);
  });
});
