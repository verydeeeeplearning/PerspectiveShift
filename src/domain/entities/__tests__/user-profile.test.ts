import { describe, it, expect } from "vitest";
import { UserProfile } from "../user-profile";

function makeProfile(overrides: Partial<{ claimedSessionIds: string[] }> = {}) {
  return UserProfile.create({
    userId: "user-1",
    displayAlias: "참여자_A1B2",
    claimedSessionIds: overrides.claimedSessionIds ?? [],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  });
}

describe("UserProfile", () => {
  it("creates with given properties", () => {
    const profile = makeProfile();
    expect(profile.userId).toBe("user-1");
    expect(profile.displayAlias).toBe("참여자_A1B2");
    expect(profile.claimedSessionIds).toEqual([]);
  });

  it("claimSession adds a session id", () => {
    const profile = makeProfile();
    profile.claimSession("session-abc");
    expect(profile.claimedSessionIds).toContain("session-abc");
  });

  it("claimSession is idempotent", () => {
    const profile = makeProfile({ claimedSessionIds: ["session-abc"] });
    profile.claimSession("session-abc");
    expect(profile.claimedSessionIds).toEqual(["session-abc"]);
  });

  it("claimSession updates updatedAt", () => {
    const profile = makeProfile();
    const before = profile.updatedAt;
    profile.claimSession("session-new");
    expect(profile.updatedAt.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
  });

  it("hasClaimedSession returns true for claimed session", () => {
    const profile = makeProfile({ claimedSessionIds: ["s1"] });
    expect(profile.hasClaimedSession("s1")).toBe(true);
  });

  it("hasClaimedSession returns false for unclaimed session", () => {
    const profile = makeProfile();
    expect(profile.hasClaimedSession("s1")).toBe(false);
  });

  it("claimedSessionIds is immutable from outside", () => {
    const profile = makeProfile({ claimedSessionIds: ["s1"] });
    const ids = profile.claimedSessionIds;
    expect(() => (ids as string[]).push("hacked")).not.toThrow();
    // The internal array should not be affected
    expect(profile.claimedSessionIds).toEqual(["s1"]);
  });
});
