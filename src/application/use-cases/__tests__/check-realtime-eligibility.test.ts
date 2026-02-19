import { describe, it, expect, vi } from "vitest";
import { CheckRealtimeEligibilityUseCase } from "../check-realtime-eligibility";
import { Friendship } from "@/domain/entities/friendship";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";

function makeFriendship(
  overrides: Partial<{
    status: "ACTIVE" | "BLOCKED";
    dialogueCount: number;
    completedLightProtocols: number;
  }> = {},
): Friendship {
  return Friendship.create({
    id: "f-1",
    userA: "alice",
    userB: "bob",
    status: overrides.status ?? "ACTIVE",
    dialogueCount: overrides.dialogueCount ?? 0,
    completedLightProtocols: overrides.completedLightProtocols ?? 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeDeps(friendship: Friendship | null) {
  return {
    friendshipRepository: {
      findById: vi.fn().mockResolvedValue(friendship),
      findByUsers: vi.fn().mockResolvedValue(null),
      findByUser: vi.fn().mockResolvedValue([]),
      save: vi.fn(),
      update: vi.fn(),
    } satisfies FriendshipRepository,
  };
}

describe("CheckRealtimeEligibilityUseCase", () => {
  it("returns eligible when conditions are met", async () => {
    const friendship = makeFriendship({
      dialogueCount: 3,
      completedLightProtocols: 1,
    });
    const deps = makeDeps(friendship);
    const uc = new CheckRealtimeEligibilityUseCase(deps);

    const result = await uc.execute("f-1");

    expect(result.eligible).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("returns ineligible when dialogueCount < 2", async () => {
    const friendship = makeFriendship({
      dialogueCount: 1,
      completedLightProtocols: 1,
    });
    const deps = makeDeps(friendship);
    const uc = new CheckRealtimeEligibilityUseCase(deps);

    const result = await uc.execute("f-1");

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("1회 더 완료");
  });

  it("returns ineligible when no light protocols completed", async () => {
    const friendship = makeFriendship({
      dialogueCount: 3,
      completedLightProtocols: 0,
    });
    const deps = makeDeps(friendship);
    const uc = new CheckRealtimeEligibilityUseCase(deps);

    const result = await uc.execute("f-1");

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("라이트 프로토콜");
  });

  it("returns ineligible when friendship is not active", async () => {
    const friendship = makeFriendship({ status: "BLOCKED", dialogueCount: 5, completedLightProtocols: 2 });
    const deps = makeDeps(friendship);
    const uc = new CheckRealtimeEligibilityUseCase(deps);

    const result = await uc.execute("f-1");

    expect(result.eligible).toBe(false);
  });

  it("throws when friendship not found", async () => {
    const deps = makeDeps(null);
    const uc = new CheckRealtimeEligibilityUseCase(deps);

    await expect(uc.execute("f-99")).rejects.toThrow("Friendship f-99 not found");
  });
});
