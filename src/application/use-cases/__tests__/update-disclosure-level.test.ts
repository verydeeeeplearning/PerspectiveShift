import { describe, it, expect, vi } from "vitest";
import { UpdateDisclosureLevelUseCase } from "../update-disclosure-level";
import { DisclosureSetting } from "@/domain/entities/disclosure-setting";
import { DisclosureLevel } from "@/domain/value-objects/disclosure-level";
import { Friendship } from "@/domain/entities/friendship";
import {
  FriendshipNotFoundError,
  FriendshipNotActiveError,
  UnauthorizedParticipantError,
  InvalidDisclosureLevelError,
} from "@/domain/errors/domain-errors";
import type { DisclosureRepository } from "@/domain/interfaces/disclosure-repository";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";

function makeFriendship(
  overrides: { status?: "ACTIVE" | "UNMATCHED" | "BLOCKED" } = {},
) {
  return Friendship.create({
    id: "friendship-1",
    userA: "user-a",
    userB: "user-b",
    status: overrides.status ?? "ACTIVE",
    dialogueCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeExistingSetting(levelValue: number = 0) {
  return DisclosureSetting.create({
    id: "setting-1",
    friendshipId: "friendship-1",
    fromUserId: "user-a",
    toUserId: "user-b",
    level: DisclosureLevel.create(levelValue),
    updatedAt: new Date(),
  });
}

describe("UpdateDisclosureLevelUseCase", () => {
  function setup(
    friendship: Friendship | null = makeFriendship(),
    existingSetting: DisclosureSetting | null = null,
  ) {
    const disclosureRepo: DisclosureRepository = {
      findByFriendship: vi.fn(),
      findByDirection: vi.fn().mockResolvedValue(existingSetting),
      save: vi.fn(),
      update: vi.fn(),
    };
    const friendshipRepo: FriendshipRepository = {
      findById: vi.fn().mockResolvedValue(friendship),
      findByUsers: vi.fn(),
      findByUser: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };
    const uc = new UpdateDisclosureLevelUseCase({
      disclosureRepository: disclosureRepo,
      friendshipRepository: friendshipRepo,
    });
    return { uc, disclosureRepo, friendshipRepo };
  }

  it("creates new disclosure setting when none exists", async () => {
    const { uc, disclosureRepo } = setup();
    const result = await uc.execute(
      "user-a",
      "friendship-1",
      "user-b",
      1,
    );
    expect(result.level).toBe(1);
    expect(result.levelLabel).toBe("유형 공개");
    expect(result.fromUserId).toBe("user-a");
    expect(result.toUserId).toBe("user-b");
    expect(disclosureRepo.save).toHaveBeenCalledOnce();
  });

  it("escalates existing disclosure setting", async () => {
    const existing = makeExistingSetting(1);
    const { uc, disclosureRepo } = setup(makeFriendship(), existing);
    const result = await uc.execute(
      "user-a",
      "friendship-1",
      "user-b",
      2,
    );
    expect(result.level).toBe(2);
    expect(result.levelLabel).toBe("스탠스 공개");
    expect(disclosureRepo.update).toHaveBeenCalledOnce();
    expect(disclosureRepo.save).not.toHaveBeenCalled();
  });

  it("throws FriendshipNotFoundError when friendship does not exist", async () => {
    const { uc } = setup(null);
    await expect(
      uc.execute("user-a", "friendship-1", "user-b", 1),
    ).rejects.toThrow(FriendshipNotFoundError);
  });

  it("throws FriendshipNotActiveError when friendship is not active", async () => {
    const blocked = makeFriendship({ status: "BLOCKED" });
    const { uc } = setup(blocked);
    await expect(
      uc.execute("user-a", "friendship-1", "user-b", 1),
    ).rejects.toThrow(FriendshipNotActiveError);
  });

  it("throws UnauthorizedParticipantError when user is not a member", async () => {
    const { uc } = setup();
    await expect(
      uc.execute("stranger", "friendship-1", "user-b", 1),
    ).rejects.toThrow(UnauthorizedParticipantError);
  });

  it("throws UnauthorizedParticipantError when target is not a member", async () => {
    const { uc } = setup();
    await expect(
      uc.execute("user-a", "friendship-1", "stranger", 1),
    ).rejects.toThrow(UnauthorizedParticipantError);
  });

  it("throws InvalidDisclosureLevelError when trying to downgrade", async () => {
    const existing = makeExistingSetting(2);
    const { uc } = setup(makeFriendship(), existing);
    await expect(
      uc.execute("user-a", "friendship-1", "user-b", 1),
    ).rejects.toThrow(InvalidDisclosureLevelError);
  });

  it("throws InvalidDisclosureLevelError when escalating to same level", async () => {
    const existing = makeExistingSetting(1);
    const { uc } = setup(makeFriendship(), existing);
    await expect(
      uc.execute("user-a", "friendship-1", "user-b", 1),
    ).rejects.toThrow(InvalidDisclosureLevelError);
  });

  it("creates setting with level 0 for new disclosure", async () => {
    const { uc, disclosureRepo } = setup();
    const result = await uc.execute(
      "user-a",
      "friendship-1",
      "user-b",
      0,
    );
    expect(result.level).toBe(0);
    expect(result.levelLabel).toBe("익명");
    expect(disclosureRepo.save).toHaveBeenCalledOnce();
  });

  it("creates setting with max level 3", async () => {
    const { uc } = setup();
    const result = await uc.execute(
      "user-a",
      "friendship-1",
      "user-b",
      3,
    );
    expect(result.level).toBe(3);
    expect(result.levelLabel).toBe("이름 공개");
  });
});
