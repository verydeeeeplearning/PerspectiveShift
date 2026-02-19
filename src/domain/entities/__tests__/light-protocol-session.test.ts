import { describe, it, expect } from "vitest";
import { LightProtocolSession } from "../light-protocol-session";
import type { LightProtocolType } from "../../value-objects/light-protocol-type";

function makeSession(
  type: LightProtocolType = "COMMON_GROUND",
  createdAt: Date = new Date(),
) {
  return LightProtocolSession.create({
    id: "lp-1",
    friendshipId: "f-1",
    type,
    initiatorId: "user-a",
    createdAt,
  });
}

describe("LightProtocolSession", () => {
  it("creates with ACTIVE status and null responses", () => {
    const session = makeSession();
    expect(session.id).toBe("lp-1");
    expect(session.friendshipId).toBe("f-1");
    expect(session.type).toBe("COMMON_GROUND");
    expect(session.initiatorId).toBe("user-a");
    expect(session.status).toBe("ACTIVE");
    expect(session.initiatorResponse).toBeNull();
    expect(session.responderResponse).toBeNull();
    expect(session.completedAt).toBeNull();
  });

  it("reconstitutes from saved props", () => {
    const session = LightProtocolSession.reconstitute({
      id: "lp-2",
      friendshipId: "f-1",
      type: "JOINT_QUESTION",
      initiatorId: "user-a",
      status: "COMPLETED",
      initiatorResponse: { proposedQuestion: "Why?" },
      responderResponse: { proposedQuestion: "Why not?" },
      createdAt: new Date(),
      completedAt: new Date(),
    });
    expect(session.status).toBe("COMPLETED");
    expect(session.initiatorResponse).toEqual({ proposedQuestion: "Why?" });
  });

  describe("submitInitiatorResponse", () => {
    it("sets initiator response", () => {
      const session = makeSession();
      session.submitInitiatorResponse({
        agreedPoint: "We both value fairness",
        differentPoint: "Approach differs",
        curiousPoint: "What about education?",
      });
      expect(session.initiatorResponse).toBeTruthy();
      expect(session.status).toBe("ACTIVE");
    });

    it("throws when session is not active", () => {
      const session = makeSession();
      session.expire();
      expect(() =>
        session.submitInitiatorResponse({ agreedPoint: "x" }),
      ).toThrow("Session is not active");
    });
  });

  describe("submitResponderResponse", () => {
    it("sets responder response", () => {
      const session = makeSession();
      session.submitResponderResponse({
        agreedPoint: "Fairness matters",
        differentPoint: "Method differs",
        curiousPoint: "Impact on youth?",
      });
      expect(session.responderResponse).toBeTruthy();
      expect(session.status).toBe("ACTIVE");
    });

    it("throws when session is not active", () => {
      const session = makeSession();
      session.expire();
      expect(() =>
        session.submitResponderResponse({ agreedPoint: "x" }),
      ).toThrow("Session is not active");
    });
  });

  describe("auto-completion", () => {
    it("completes when both responses are submitted", () => {
      const session = makeSession();
      session.submitInitiatorResponse({ agreedPoint: "A" });
      expect(session.isCompleted()).toBe(false);

      session.submitResponderResponse({ agreedPoint: "B" });
      expect(session.isCompleted()).toBe(true);
      expect(session.status).toBe("COMPLETED");
      expect(session.completedAt).toBeInstanceOf(Date);
    });

    it("completes regardless of submission order", () => {
      const session = makeSession("SWITCH_SIDES");
      session.submitResponderResponse({ switchedPerspective: "From your view..." });
      expect(session.isCompleted()).toBe(false);

      session.submitInitiatorResponse({ switchedPerspective: "From my view..." });
      expect(session.isCompleted()).toBe(true);
    });
  });

  describe("expiry", () => {
    it("isExpired returns false within 24 hours", () => {
      const session = makeSession();
      const within24h = new Date(
        session.createdAt.getTime() + 23 * 60 * 60 * 1000,
      );
      expect(session.isExpired(within24h)).toBe(false);
    });

    it("isExpired returns true after 24 hours", () => {
      const session = makeSession();
      const after24h = new Date(
        session.createdAt.getTime() + 25 * 60 * 60 * 1000,
      );
      expect(session.isExpired(after24h)).toBe(true);
    });

    it("isExpired returns false for completed sessions", () => {
      const session = makeSession();
      session.submitInitiatorResponse({ agreedPoint: "A" });
      session.submitResponderResponse({ agreedPoint: "B" });
      const after24h = new Date(
        session.createdAt.getTime() + 25 * 60 * 60 * 1000,
      );
      expect(session.isExpired(after24h)).toBe(false);
    });

    it("expire() sets status to EXPIRED", () => {
      const session = makeSession();
      session.expire();
      expect(session.status).toBe("EXPIRED");
    });

    it("expire() does nothing for completed sessions", () => {
      const session = makeSession();
      session.submitInitiatorResponse({ agreedPoint: "A" });
      session.submitResponderResponse({ agreedPoint: "B" });
      session.expire();
      expect(session.status).toBe("COMPLETED");
    });
  });

  describe("protocol types", () => {
    it("works with COMMON_GROUND type", () => {
      const session = makeSession("COMMON_GROUND");
      expect(session.type).toBe("COMMON_GROUND");
    });

    it("works with JOINT_QUESTION type", () => {
      const session = makeSession("JOINT_QUESTION");
      expect(session.type).toBe("JOINT_QUESTION");
    });

    it("works with SWITCH_SIDES type", () => {
      const session = makeSession("SWITCH_SIDES");
      expect(session.type).toBe("SWITCH_SIDES");
    });
  });
});
