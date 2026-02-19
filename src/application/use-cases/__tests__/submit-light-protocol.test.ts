import { describe, it, expect, vi } from "vitest";
import { SubmitLightProtocolUseCase } from "../submit-light-protocol";
import { LightProtocolSession } from "@/domain/entities/light-protocol-session";
import { Friendship } from "@/domain/entities/friendship";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { LightProtocolRepository } from "@/domain/interfaces/light-protocol-repository";

function makeActiveSession() {
  return LightProtocolSession.create({
    id: "lp-1",
    friendshipId: "f-1",
    type: "COMMON_GROUND",
    initiatorId: "alice",
    createdAt: new Date(),
  });
}

function makeExpiredSession() {
  return LightProtocolSession.create({
    id: "lp-2",
    friendshipId: "f-1",
    type: "COMMON_GROUND",
    initiatorId: "alice",
    createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
  });
}

function makeFriendship() {
  return Friendship.create({
    id: "f-1",
    userA: "alice",
    userB: "bob",
    status: "ACTIVE",
    dialogueCount: 1,
    completedLightProtocols: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeDeps(
  session: LightProtocolSession | null,
  friendship: Friendship | null = makeFriendship(),
) {
  return {
    friendshipRepository: {
      findById: vi.fn().mockResolvedValue(friendship),
      findByUsers: vi.fn().mockResolvedValue(null),
      findByUser: vi.fn().mockResolvedValue([]),
      save: vi.fn(),
      update: vi.fn(),
    } satisfies FriendshipRepository,
    lightProtocolRepository: {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(session),
      findByFriendship: vi.fn().mockResolvedValue([]),
      findActiveByFriendship: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
    } satisfies LightProtocolRepository,
  };
}

describe("SubmitLightProtocolUseCase", () => {
  it("submits initiator response and stays ACTIVE", async () => {
    const session = makeActiveSession();
    const deps = makeDeps(session);
    const uc = new SubmitLightProtocolUseCase(deps);

    const result = await uc.execute("lp-1", "alice", { agreedPoint: "fairness" });

    expect(result.status).toBe("ACTIVE");
    expect(result.initiatorResponse).toEqual({ agreedPoint: "fairness" });
    expect(deps.lightProtocolRepository.update).toHaveBeenCalled();
  });

  it("submits responder response and stays ACTIVE", async () => {
    const session = makeActiveSession();
    const deps = makeDeps(session);
    const uc = new SubmitLightProtocolUseCase(deps);

    const result = await uc.execute("lp-1", "bob", { agreedPoint: "equality" });

    expect(result.status).toBe("ACTIVE");
    expect(result.responderResponse).toEqual({ agreedPoint: "equality" });
  });

  it("completes session and increments friendship count when both respond", async () => {
    const session = makeActiveSession();
    session.submitInitiatorResponse({ agreedPoint: "fairness" });
    const deps = makeDeps(session);
    const uc = new SubmitLightProtocolUseCase(deps);

    const result = await uc.execute("lp-1", "bob", { agreedPoint: "equality" });

    expect(result.status).toBe("COMPLETED");
    expect(result.completedAt).toBeTruthy();
    expect(deps.friendshipRepository.update).toHaveBeenCalled();
  });

  it("throws when session is expired", async () => {
    const session = makeExpiredSession();
    const deps = makeDeps(session);
    const uc = new SubmitLightProtocolUseCase(deps);

    await expect(
      uc.execute("lp-2", "alice", { agreedPoint: "fairness" }),
    ).rejects.toThrow("Session has expired");
  });

  it("throws when session not found", async () => {
    const deps = makeDeps(null);
    const uc = new SubmitLightProtocolUseCase(deps);

    await expect(
      uc.execute("lp-99", "alice", { agreedPoint: "x" }),
    ).rejects.toThrow("Light protocol session lp-99 not found");
  });
});
