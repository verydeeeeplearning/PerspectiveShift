import { describe, it, expect, vi } from "vitest";
import { CreateOfflineProposalUseCase } from "../create-offline-proposal";
import { Friendship } from "@/domain/entities/friendship";
import { DisclosureSetting } from "@/domain/entities/disclosure-setting";
import { DisclosureLevel } from "@/domain/value-objects/disclosure-level";
import {
  FriendshipNotFoundError,
  FriendshipNotActiveError,
  UnauthorizedParticipantError,
  MeetingConditionsNotMetError,
} from "@/domain/errors/domain-errors";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { DisclosureRepository } from "@/domain/interfaces/disclosure-repository";
import type { MeetingRepository } from "@/domain/interfaces/meeting-repository";

function makeFriendship(dialogueCount = 3) {
  return Friendship.create({
    id: "f-1",
    userA: "aaa",
    userB: "bbb",
    status: "ACTIVE",
    dialogueCount,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeDisclosure(level = 2) {
  return DisclosureSetting.create({
    id: "d-1",
    friendshipId: "f-1",
    fromUserId: "aaa",
    toUserId: "bbb",
    level: DisclosureLevel.create(level),
    updatedAt: new Date(),
  });
}

function setup(overrides: {
  friendship?: Friendship | null;
  disclosure?: DisclosureSetting | null;
} = {}) {
  const friendshipRepo: FriendshipRepository = {
    findById: vi
      .fn()
      .mockResolvedValue(
        "friendship" in overrides
          ? overrides.friendship
          : makeFriendship(),
      ),
    findByUsers: vi.fn(),
    findByUser: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
  };

  const disclosureRepo: DisclosureRepository = {
    findByFriendship: vi.fn(),
    findByDirection: vi
      .fn()
      .mockResolvedValue(
        "disclosure" in overrides
          ? overrides.disclosure
          : makeDisclosure(),
      ),
    save: vi.fn(),
    update: vi.fn(),
  };

  const meetingRepo: MeetingRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByFriendship: vi.fn(),
    update: vi.fn(),
  };

  const uc = new CreateOfflineProposalUseCase({
    friendshipRepository: friendshipRepo,
    disclosureRepository: disclosureRepo,
    meetingRepository: meetingRepo,
  });

  return { uc, friendshipRepo, disclosureRepo, meetingRepo };
}

describe("CreateOfflineProposalUseCase", () => {
  it("creates proposal when conditions met", async () => {
    const { uc, meetingRepo } = setup();
    const result = await uc.execute("aaa", "f-1");

    expect(result.status).toBe("PROPOSED");
    expect(result.proposerId).toBe("aaa");
    expect(meetingRepo.save).toHaveBeenCalledOnce();
  });

  it("throws when friendship not found", async () => {
    const { uc } = setup({ friendship: null });
    await expect(uc.execute("aaa", "f-1")).rejects.toThrow(
      FriendshipNotFoundError,
    );
  });

  it("throws when not a member", async () => {
    const { uc } = setup();
    await expect(uc.execute("ccc", "f-1")).rejects.toThrow(
      UnauthorizedParticipantError,
    );
  });

  it("throws when friendship not active", async () => {
    const blocked = Friendship.create({
      id: "f-1",
      userA: "aaa",
      userB: "bbb",
      status: "BLOCKED",
      dialogueCount: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const { uc } = setup({ friendship: blocked });
    await expect(uc.execute("aaa", "f-1")).rejects.toThrow(
      FriendshipNotActiveError,
    );
  });

  it("throws when dialogue count < 3", async () => {
    const { uc } = setup({ friendship: makeFriendship(2) });
    await expect(uc.execute("aaa", "f-1")).rejects.toThrow(
      MeetingConditionsNotMetError,
    );
  });

  it("throws when disclosure level < 2", async () => {
    const { uc } = setup({ disclosure: makeDisclosure(1) });
    await expect(uc.execute("aaa", "f-1")).rejects.toThrow(
      MeetingConditionsNotMetError,
    );
  });

  it("throws when no disclosure exists", async () => {
    const { uc } = setup({ disclosure: null });
    await expect(uc.execute("aaa", "f-1")).rejects.toThrow(
      MeetingConditionsNotMetError,
    );
  });

  it("passes location hint and proposed time", async () => {
    const { uc, meetingRepo } = setup();
    const result = await uc.execute(
      "aaa",
      "f-1",
      "2026-03-01T14:00:00Z",
      "강남역",
    );

    expect(result.locationHint).toBe("강남역");
    expect(result.proposedAt).toBeTruthy();
    expect(meetingRepo.save).toHaveBeenCalledOnce();
  });
});
