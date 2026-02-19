import { describe, it, expect, vi } from "vitest";
import { StartLightProtocolUseCase } from "../start-light-protocol";
import { Friendship } from "@/domain/entities/friendship";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { LightProtocolRepository } from "@/domain/interfaces/light-protocol-repository";

function makeFriendship(
  overrides: Partial<{ status: "ACTIVE" | "BLOCKED"; dialogueCount: number }> = {},
): Friendship {
  return Friendship.create({
    id: "f-1",
    userA: "alice",
    userB: "bob",
    status: overrides.status ?? "ACTIVE",
    dialogueCount: overrides.dialogueCount ?? 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeDeps(
  friendship: Friendship | null,
  activeSession: null = null,
): { friendshipRepository: FriendshipRepository; lightProtocolRepository: LightProtocolRepository } {
  return {
    friendshipRepository: {
      findById: vi.fn().mockResolvedValue(friendship),
      findByUsers: vi.fn().mockResolvedValue(null),
      findByUser: vi.fn().mockResolvedValue([]),
      save: vi.fn(),
      update: vi.fn(),
    },
    lightProtocolRepository: {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findByFriendship: vi.fn().mockResolvedValue([]),
      findActiveByFriendship: vi.fn().mockResolvedValue(activeSession),
      update: vi.fn(),
    },
  };
}

describe("StartLightProtocolUseCase", () => {
  it("creates a new light protocol session", async () => {
    const friendship = makeFriendship();
    const deps = makeDeps(friendship);
    const uc = new StartLightProtocolUseCase(deps);

    const result = await uc.execute("f-1", "alice", "COMMON_GROUND");

    expect(result.friendshipId).toBe("f-1");
    expect(result.type).toBe("COMMON_GROUND");
    expect(result.initiatorId).toBe("alice");
    expect(result.status).toBe("ACTIVE");
    expect(deps.lightProtocolRepository.save).toHaveBeenCalled();
  });

  it("throws when friendship not found", async () => {
    const deps = makeDeps(null);
    const uc = new StartLightProtocolUseCase(deps);

    await expect(uc.execute("f-1", "alice", "COMMON_GROUND")).rejects.toThrow(
      "Friendship f-1 not found",
    );
  });

  it("throws when user is not a member", async () => {
    const friendship = makeFriendship();
    const deps = makeDeps(friendship);
    const uc = new StartLightProtocolUseCase(deps);

    await expect(uc.execute("f-1", "stranger", "COMMON_GROUND")).rejects.toThrow(
      "User is not a member",
    );
  });

  it("throws when friendship is not active", async () => {
    const friendship = makeFriendship({ status: "BLOCKED" });
    const deps = makeDeps(friendship);
    const uc = new StartLightProtocolUseCase(deps);

    await expect(uc.execute("f-1", "alice", "COMMON_GROUND")).rejects.toThrow(
      "Friendship is not active",
    );
  });
});
