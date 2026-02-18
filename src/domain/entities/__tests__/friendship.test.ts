import { describe, it, expect } from "vitest";
import { Friendship } from "../friendship";

function makeFriendship(
  overrides: Partial<{
    status: "ACTIVE" | "UNMATCHED" | "BLOCKED";
    dialogueCount: number;
  }> = {},
) {
  return Friendship.create({
    id: "f-1",
    userA: "aaa",
    userB: "bbb",
    status: overrides.status ?? "ACTIVE",
    dialogueCount: overrides.dialogueCount ?? 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe("Friendship", () => {
  it("creates with given properties", () => {
    const f = makeFriendship();
    expect(f.id).toBe("f-1");
    expect(f.userA).toBe("aaa");
    expect(f.userB).toBe("bbb");
    expect(f.status).toBe("ACTIVE");
  });

  describe("normalizePair", () => {
    it("returns sorted pair when first < second", () => {
      expect(Friendship.normalizePair("aaa", "bbb")).toEqual([
        "aaa",
        "bbb",
      ]);
    });

    it("swaps when first > second", () => {
      expect(Friendship.normalizePair("bbb", "aaa")).toEqual([
        "aaa",
        "bbb",
      ]);
    });
  });

  describe("isMember", () => {
    it("returns true for userA", () => {
      expect(makeFriendship().isMember("aaa")).toBe(true);
    });

    it("returns true for userB", () => {
      expect(makeFriendship().isMember("bbb")).toBe(true);
    });

    it("returns false for non-member", () => {
      expect(makeFriendship().isMember("ccc")).toBe(false);
    });
  });

  describe("status transitions", () => {
    it("block changes status to BLOCKED", () => {
      const f = makeFriendship();
      f.block();
      expect(f.status).toBe("BLOCKED");
    });

    it("unmatch changes status to UNMATCHED", () => {
      const f = makeFriendship();
      f.unmatch();
      expect(f.status).toBe("UNMATCHED");
    });
  });

  describe("isActive", () => {
    it("returns true for ACTIVE", () => {
      expect(makeFriendship().isActive()).toBe(true);
    });

    it("returns false for BLOCKED", () => {
      expect(
        makeFriendship({ status: "BLOCKED" }).isActive(),
      ).toBe(false);
    });
  });

  describe("incrementDialogueCount", () => {
    it("increments count", () => {
      const f = makeFriendship({ dialogueCount: 2 });
      f.incrementDialogueCount();
      expect(f.dialogueCount).toBe(3);
    });
  });

  describe("meetsRealtimeThreshold", () => {
    it("returns true when active", () => {
      expect(makeFriendship().meetsRealtimeThreshold()).toBe(true);
    });

    it("returns false when blocked", () => {
      const f = makeFriendship({ status: "BLOCKED" });
      expect(f.meetsRealtimeThreshold()).toBe(false);
    });
  });

  describe("meetsOfflineThreshold", () => {
    it("returns true when dialogueCount >= 3 and disclosure >= 2", () => {
      const f = makeFriendship({ dialogueCount: 3 });
      expect(f.meetsOfflineThreshold(2)).toBe(true);
    });

    it("returns false when dialogueCount < 3", () => {
      const f = makeFriendship({ dialogueCount: 2 });
      expect(f.meetsOfflineThreshold(2)).toBe(false);
    });

    it("returns false when disclosure < 2", () => {
      const f = makeFriendship({ dialogueCount: 3 });
      expect(f.meetsOfflineThreshold(1)).toBe(false);
    });
  });
});
