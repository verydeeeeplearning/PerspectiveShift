import { describe, it, expect, vi } from "vitest";
import { UnblockUserUseCase } from "../unblock-user";
import type { BlockRepository } from "@/domain/interfaces/block-repository";

describe("UnblockUserUseCase", () => {
  function setup() {
    const blockRepo: BlockRepository = {
      isBlocked: vi.fn(),
      isBlockedEitherDirection: vi.fn(),
      block: vi.fn(),
      unblock: vi.fn(),
    };
    const uc = new UnblockUserUseCase({
      blockRepository: blockRepo,
    });
    return { uc, blockRepo };
  }

  it("calls unblock on the repository", async () => {
    const { uc, blockRepo } = setup();
    await uc.execute("alice", "bob");

    expect(blockRepo.unblock).toHaveBeenCalledWith("alice", "bob");
  });

  it("passes correct blocker and blocked IDs", async () => {
    const { uc, blockRepo } = setup();
    await uc.execute("user-A", "user-B");

    expect(blockRepo.unblock).toHaveBeenCalledWith(
      "user-A",
      "user-B",
    );
  });

  it("calls unblock exactly once", async () => {
    const { uc, blockRepo } = setup();
    await uc.execute("x", "y");

    expect(blockRepo.unblock).toHaveBeenCalledOnce();
  });
});
