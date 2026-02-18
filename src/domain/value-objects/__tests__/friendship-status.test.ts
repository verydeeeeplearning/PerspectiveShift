import { describe, it, expect } from "vitest";
import {
  FRIENDSHIP_STATUSES,
  isValidFriendshipStatus,
} from "../friendship-status";

describe("FriendshipStatus", () => {
  it("has three valid statuses", () => {
    expect(FRIENDSHIP_STATUSES).toHaveLength(3);
    expect(FRIENDSHIP_STATUSES).toContain("ACTIVE");
    expect(FRIENDSHIP_STATUSES).toContain("UNMATCHED");
    expect(FRIENDSHIP_STATUSES).toContain("BLOCKED");
  });

  describe("isValidFriendshipStatus", () => {
    it("validates known statuses", () => {
      expect(isValidFriendshipStatus("ACTIVE")).toBe(true);
      expect(isValidFriendshipStatus("BLOCKED")).toBe(true);
    });

    it("rejects unknown statuses", () => {
      expect(isValidFriendshipStatus("UNKNOWN")).toBe(false);
    });
  });
});
