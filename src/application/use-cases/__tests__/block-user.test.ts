import { describe, it, expect, vi } from "vitest";
import { BlockUserUseCase } from "../block-user";
import { Friendship } from "@/domain/entities/friendship";
import { DuplicateBlockError } from "@/domain/errors/domain-errors";
import type { BlockRepository } from "@/domain/interfaces/block-repository";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";

function makeFriendship(
  status: "ACTIVE" | "UNMATCHED" | "BLOCKED" = "ACTIVE",
) {
  return Friendship.create({
    id: "f-1",
    userA: "alice",
    userB: "bob",
    status,
    dialogueCount: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe("BlockUserUseCase", () => {
  function setup(opts: {
    alreadyBlocked?: boolean;
    friendship?: Friendship | null;
  } = {}) {
    const blockRepo: BlockRepository = {
      isBlocked: vi
        .fn()
        .mockResolvedValue(opts.alreadyBlocked ?? false),
      isBlockedEitherDirection: vi.fn(),
      block: vi.fn(),
      unblock: vi.fn(),
    };
    const friendshipRepo: FriendshipRepository = {
      findById: vi.fn(),
      findByUsers: vi
        .fn()
        .mockResolvedValue(
          opts.friendship !== undefined ? opts.friendship : null,
        ),
      findByUser: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };
    const uc = new BlockUserUseCase({
      blockRepository: blockRepo,
      friendshipRepository: friendshipRepo,
    });
    return { uc, blockRepo, friendshipRepo };
  }

  it("blocks a user successfully", async () => {
    const { uc, blockRepo } = setup();
    await uc.execute("alice", "bob");
    expect(blockRepo.block).toHaveBeenCalledWith("alice", "bob");
  });

  it("throws DuplicateBlockError if already blocked", async () => {
    const { uc } = setup({ alreadyBlocked: true });
    await expect(uc.execute("alice", "bob")).rejects.toThrow(
      DuplicateBlockError,
    );
  });

  it("marks active friendship as BLOCKED", async () => {
    const friendship = makeFriendship("ACTIVE");
    const { uc, friendshipRepo } = setup({ friendship });
    await uc.execute("alice", "bob");

    expect(friendshipRepo.update).toHaveBeenCalledOnce();
    expect(friendship.status).toBe("BLOCKED");
  });

  it("does not update friendship if not active", async () => {
    const friendship = makeFriendship("UNMATCHED");
    const { uc, friendshipRepo } = setup({ friendship });
    await uc.execute("alice", "bob");

    expect(friendshipRepo.update).not.toHaveBeenCalled();
  });

  it("does not update friendship if none exists", async () => {
    const { uc, friendshipRepo } = setup({ friendship: null });
    await uc.execute("alice", "bob");

    expect(friendshipRepo.update).not.toHaveBeenCalled();
  });

  it("checks block status before blocking", async () => {
    const { uc, blockRepo } = setup();
    await uc.execute("alice", "bob");

    expect(blockRepo.isBlocked).toHaveBeenCalledWith(
      "alice",
      "bob",
    );
    expect(blockRepo.block).toHaveBeenCalledAfter(
      blockRepo.isBlocked as ReturnType<typeof vi.fn>,
    );
  });
});
