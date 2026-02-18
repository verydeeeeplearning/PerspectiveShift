import { describe, it, expect, vi } from "vitest";
import { UnfriendUseCase } from "../unfriend";
import { Friendship } from "@/domain/entities/friendship";
import {
  FriendshipNotFoundError,
  FriendshipNotActiveError,
  UnauthorizedParticipantError,
} from "@/domain/errors/domain-errors";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";

function makeFriendship(status: "ACTIVE" | "BLOCKED" = "ACTIVE") {
  return Friendship.create({
    id: "f-1",
    userA: "aaa",
    userB: "bbb",
    status,
    dialogueCount: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function setup(friendship: Friendship | null = makeFriendship()) {
  const repo: FriendshipRepository = {
    findById: vi.fn().mockResolvedValue(friendship),
    findByUsers: vi.fn(),
    findByUser: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
  };

  const uc = new UnfriendUseCase({ friendshipRepository: repo });
  return { uc, repo };
}

describe("UnfriendUseCase", () => {
  it("changes friendship to UNMATCHED", async () => {
    const { uc, repo } = setup();
    await uc.execute("f-1", "aaa");

    expect(repo.update).toHaveBeenCalledOnce();
    const updated = (repo.update as ReturnType<typeof vi.fn>).mock
      .calls[0][0];
    expect(updated.status).toBe("UNMATCHED");
  });

  it("throws FriendshipNotFoundError when not found", async () => {
    const { uc } = setup(null);
    await expect(uc.execute("f-1", "aaa")).rejects.toThrow(
      FriendshipNotFoundError,
    );
  });

  it("throws UnauthorizedParticipantError for non-member", async () => {
    const { uc } = setup();
    await expect(uc.execute("f-1", "ccc")).rejects.toThrow(
      UnauthorizedParticipantError,
    );
  });

  it("throws FriendshipNotActiveError when already blocked", async () => {
    const { uc } = setup(makeFriendship("BLOCKED"));
    await expect(uc.execute("f-1", "aaa")).rejects.toThrow(
      FriendshipNotActiveError,
    );
  });
});
