import { describe, it, expect } from "vitest";
import { DisclosureSetting } from "../disclosure-setting";
import { DisclosureLevel } from "../../value-objects/disclosure-level";
import { InvalidDisclosureLevelError } from "../../errors/domain-errors";

function makeSetting(levelValue: number = 0) {
  return DisclosureSetting.create({
    id: "setting-1",
    friendshipId: "friendship-1",
    fromUserId: "user-a",
    toUserId: "user-b",
    level: DisclosureLevel.create(levelValue),
    updatedAt: new Date("2026-01-01"),
  });
}

describe("DisclosureSetting", () => {
  it("creates with correct props", () => {
    const setting = makeSetting();
    expect(setting.id).toBe("setting-1");
    expect(setting.friendshipId).toBe("friendship-1");
    expect(setting.fromUserId).toBe("user-a");
    expect(setting.toUserId).toBe("user-b");
    expect(setting.level.value).toBe(0);
  });

  it("exposes level via getter", () => {
    const setting = makeSetting(2);
    expect(setting.level.value).toBe(2);
  });

  it("exposes updatedAt via getter", () => {
    const setting = makeSetting();
    expect(setting.updatedAt).toEqual(new Date("2026-01-01"));
  });

  describe("escalateTo", () => {
    it("escalates from level 0 to level 1", () => {
      const setting = makeSetting(0);
      setting.escalateTo(DisclosureLevel.create(1));
      expect(setting.level.value).toBe(1);
    });

    it("escalates from level 0 to level 3", () => {
      const setting = makeSetting(0);
      setting.escalateTo(DisclosureLevel.create(3));
      expect(setting.level.value).toBe(3);
    });

    it("escalates from level 1 to level 2", () => {
      const setting = makeSetting(1);
      setting.escalateTo(DisclosureLevel.create(2));
      expect(setting.level.value).toBe(2);
    });

    it("updates updatedAt on escalation", () => {
      const setting = makeSetting(0);
      const before = setting.updatedAt;
      setting.escalateTo(DisclosureLevel.create(1));
      expect(setting.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });

    it("throws InvalidDisclosureLevelError when escalating to same level", () => {
      const setting = makeSetting(1);
      expect(() =>
        setting.escalateTo(DisclosureLevel.create(1)),
      ).toThrow(InvalidDisclosureLevelError);
    });

    it("throws InvalidDisclosureLevelError when escalating to lower level", () => {
      const setting = makeSetting(2);
      expect(() =>
        setting.escalateTo(DisclosureLevel.create(1)),
      ).toThrow(InvalidDisclosureLevelError);
    });

    it("throws InvalidDisclosureLevelError when at max level", () => {
      const setting = makeSetting(3);
      expect(() =>
        setting.escalateTo(DisclosureLevel.create(3)),
      ).toThrow(InvalidDisclosureLevelError);
    });
  });
});
