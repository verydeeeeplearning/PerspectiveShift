import { describe, it, expect, vi } from "vitest";
import { GetDisclosureLevelsUseCase } from "../get-disclosure-levels";
import { DisclosureSetting } from "@/domain/entities/disclosure-setting";
import { DisclosureLevel } from "@/domain/value-objects/disclosure-level";
import { Friendship } from "@/domain/entities/friendship";
import {
  FriendshipNotFoundError,
  UnauthorizedParticipantError,
} from "@/domain/errors/domain-errors";
import type { DisclosureRepository } from "@/domain/interfaces/disclosure-repository";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";

function makeFriendship() {
  return Friendship.create({
    id: "friendship-1",
    userA: "user-a",
    userB: "user-b",
    status: "ACTIVE",
    dialogueCount: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeDisclosureSetting(
  from: string,
  to: string,
  levelValue: number,
) {
  return DisclosureSetting.create({
    id: `setting-${from}-${to}`,
    friendshipId: "friendship-1",
    fromUserId: from,
    toUserId: to,
    level: DisclosureLevel.create(levelValue),
    updatedAt: new Date(),
  });
}

describe("GetDisclosureLevelsUseCase", () => {
  function setup(
    friendship: Friendship | null = makeFriendship(),
    mySetting: DisclosureSetting | null = null,
    theirSetting: DisclosureSetting | null = null,
  ) {
    const disclosureRepo: DisclosureRepository = {
      findByFriendship: vi.fn(),
      findByDirection: vi
        .fn()
        .mockImplementation(
          (
            _friendshipId: string,
            fromUserId: string,
            toUserId: string,
          ) => {
            if (fromUserId === "user-a" && toUserId === "user-b") {
              return Promise.resolve(mySetting);
            }
            if (fromUserId === "user-b" && toUserId === "user-a") {
              return Promise.resolve(theirSetting);
            }
            return Promise.resolve(null);
          },
        ),
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
    const uc = new GetDisclosureLevelsUseCase({
      disclosureRepository: disclosureRepo,
      friendshipRepository: friendshipRepo,
    });
    return { uc, disclosureRepo, friendshipRepo };
  }

  it("returns default level 0 when no settings exist", async () => {
    const { uc } = setup();
    const result = await uc.execute("user-a", "friendship-1");
    expect(result.myDisclosure.level).toBe(0);
    expect(result.myDisclosure.levelLabel).toBe("익명");
    expect(result.theirDisclosure.level).toBe(0);
    expect(result.theirDisclosure.levelLabel).toBe("익명");
  });

  it("returns existing disclosure levels", async () => {
    const mySetting = makeDisclosureSetting("user-a", "user-b", 2);
    const theirSetting = makeDisclosureSetting("user-b", "user-a", 1);
    const { uc } = setup(makeFriendship(), mySetting, theirSetting);
    const result = await uc.execute("user-a", "friendship-1");

    expect(result.myDisclosure.level).toBe(2);
    expect(result.myDisclosure.levelLabel).toBe("스탠스 공개");
    expect(result.myDisclosure.fromUserId).toBe("user-a");
    expect(result.myDisclosure.toUserId).toBe("user-b");

    expect(result.theirDisclosure.level).toBe(1);
    expect(result.theirDisclosure.levelLabel).toBe("유형 공개");
    expect(result.theirDisclosure.fromUserId).toBe("user-b");
    expect(result.theirDisclosure.toUserId).toBe("user-a");
  });

  it("returns mixed: existing my setting, default their setting", async () => {
    const mySetting = makeDisclosureSetting("user-a", "user-b", 3);
    const { uc } = setup(makeFriendship(), mySetting, null);
    const result = await uc.execute("user-a", "friendship-1");

    expect(result.myDisclosure.level).toBe(3);
    expect(result.myDisclosure.levelLabel).toBe("이름 공개");
    expect(result.theirDisclosure.level).toBe(0);
    expect(result.theirDisclosure.levelLabel).toBe("익명");
  });

  it("correctly identifies other user when userId is userB", async () => {
    const mySetting = makeDisclosureSetting("user-b", "user-a", 1);
    const disclosureRepo: DisclosureRepository = {
      findByFriendship: vi.fn(),
      findByDirection: vi
        .fn()
        .mockImplementation(
          (
            _friendshipId: string,
            fromUserId: string,
            toUserId: string,
          ) => {
            if (fromUserId === "user-b" && toUserId === "user-a") {
              return Promise.resolve(mySetting);
            }
            return Promise.resolve(null);
          },
        ),
      save: vi.fn(),
      update: vi.fn(),
    };
    const friendshipRepo: FriendshipRepository = {
      findById: vi.fn().mockResolvedValue(makeFriendship()),
      findByUsers: vi.fn(),
      findByUser: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };
    const uc = new GetDisclosureLevelsUseCase({
      disclosureRepository: disclosureRepo,
      friendshipRepository: friendshipRepo,
    });
    const result = await uc.execute("user-b", "friendship-1");

    expect(result.myDisclosure.fromUserId).toBe("user-b");
    expect(result.myDisclosure.toUserId).toBe("user-a");
    expect(result.myDisclosure.level).toBe(1);
  });

  it("throws FriendshipNotFoundError when friendship does not exist", async () => {
    const { uc } = setup(null);
    await expect(
      uc.execute("user-a", "friendship-1"),
    ).rejects.toThrow(FriendshipNotFoundError);
  });

  it("throws UnauthorizedParticipantError when user is not a member", async () => {
    const { uc } = setup();
    await expect(
      uc.execute("stranger", "friendship-1"),
    ).rejects.toThrow(UnauthorizedParticipantError);
  });

  it("returns correct friendshipId in output", async () => {
    const { uc } = setup();
    const result = await uc.execute("user-a", "friendship-1");
    expect(result.myDisclosure.friendshipId).toBe("friendship-1");
    expect(result.theirDisclosure.friendshipId).toBe("friendship-1");
  });
});
