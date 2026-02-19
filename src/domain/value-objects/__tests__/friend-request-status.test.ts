import { describe, it, expect } from "vitest";
import {
  FRIEND_REQUEST_STATUSES,
  isResolvedFriendRequest,
  isValidFriendRequestStatus,
} from "../friend-request-status";

describe("FriendRequestStatus", () => {
  it("has four valid statuses", () => {
    expect(FRIEND_REQUEST_STATUSES).toHaveLength(4);
    expect(FRIEND_REQUEST_STATUSES).toContain("PENDING");
    expect(FRIEND_REQUEST_STATUSES).toContain("ACCEPTED");
    expect(FRIEND_REQUEST_STATUSES).toContain("DECLINED");
    expect(FRIEND_REQUEST_STATUSES).toContain("SILENT_REJECTED");
  });

  describe("isResolvedFriendRequest", () => {
    it("returns false for PENDING", () => {
      expect(isResolvedFriendRequest("PENDING")).toBe(false);
    });

    it("returns true for ACCEPTED", () => {
      expect(isResolvedFriendRequest("ACCEPTED")).toBe(true);
    });

    it("returns true for DECLINED", () => {
      expect(isResolvedFriendRequest("DECLINED")).toBe(true);
    });

    it("returns true for SILENT_REJECTED", () => {
      expect(isResolvedFriendRequest("SILENT_REJECTED")).toBe(true);
    });
  });

  describe("isValidFriendRequestStatus", () => {
    it("validates known statuses", () => {
      expect(isValidFriendRequestStatus("PENDING")).toBe(true);
      expect(isValidFriendRequestStatus("ACCEPTED")).toBe(true);
    });

    it("rejects unknown statuses", () => {
      expect(isValidFriendRequestStatus("UNKNOWN")).toBe(false);
    });
  });
});
