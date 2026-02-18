import { describe, it, expect } from "vitest";
import { FriendRequest } from "../friend-request";
import { FriendRequestAlreadyResolvedError } from "../../errors/domain-errors";

function makeRequest(
  status: "PENDING" | "ACCEPTED" = "PENDING",
) {
  return FriendRequest.create({
    id: "req-1",
    requesterId: "user-a",
    targetId: "user-b",
    dialogueSessionId: "session-1",
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe("FriendRequest", () => {
  it("creates with PENDING status", () => {
    const req = makeRequest();
    expect(req.status).toBe("PENDING");
    expect(req.isPending()).toBe(true);
  });

  it("accept changes status to ACCEPTED", () => {
    const req = makeRequest();
    req.accept();
    expect(req.status).toBe("ACCEPTED");
    expect(req.isPending()).toBe(false);
  });

  it("decline changes status to DECLINED", () => {
    const req = makeRequest();
    req.decline();
    expect(req.status).toBe("DECLINED");
  });

  it("silentReject changes status to SILENT_REJECTED", () => {
    const req = makeRequest();
    req.silentReject();
    expect(req.status).toBe("SILENT_REJECTED");
  });

  it("throws when accepting already resolved request", () => {
    const req = makeRequest();
    req.accept();
    expect(() => req.accept()).toThrow(
      FriendRequestAlreadyResolvedError,
    );
  });

  it("throws when declining already resolved request", () => {
    const req = makeRequest();
    req.decline();
    expect(() => req.decline()).toThrow(
      FriendRequestAlreadyResolvedError,
    );
  });

  it("throws when silent rejecting already resolved request", () => {
    const req = makeRequest();
    req.accept();
    expect(() => req.silentReject()).toThrow(
      FriendRequestAlreadyResolvedError,
    );
  });

  it("preserves properties from creation", () => {
    const req = makeRequest();
    expect(req.id).toBe("req-1");
    expect(req.requesterId).toBe("user-a");
    expect(req.targetId).toBe("user-b");
    expect(req.dialogueSessionId).toBe("session-1");
  });

  it("accept updates updatedAt", () => {
    const req = makeRequest();
    const before = req.updatedAt;
    req.accept();
    expect(req.updatedAt.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
  });
});
