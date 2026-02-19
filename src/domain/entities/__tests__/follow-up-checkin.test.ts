import { describe, it, expect } from "vitest";
import { FollowUpCheckin } from "../follow-up-checkin";

describe("FollowUpCheckin", () => {
  function makeCheckin(overrides: Partial<{
    scheduledAt: Date;
    avoidanceReduction: number | null;
    completedAt: Date | null;
  }> = {}) {
    const now = new Date();
    const scheduledAt = overrides.scheduledAt ?? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return FollowUpCheckin.create({
      id: "checkin-1",
      dialogueSessionId: "session-1",
      participantId: "alice",
      scheduledAt,
      avoidanceReduction: overrides.avoidanceReduction ?? null,
      completedAt: overrides.completedAt ?? null,
      createdAt: now,
    });
  }

  it("creates with scheduled date 1 week after", () => {
    const checkin = makeCheckin();
    expect(checkin.dialogueSessionId).toBe("session-1");
    expect(checkin.participantId).toBe("alice");
    expect(checkin.avoidanceReduction).toBeNull();
    expect(checkin.completedAt).toBeNull();
  });

  it("submits avoidance reduction score", () => {
    const checkin = makeCheckin();
    const completed = checkin.submit(4);
    expect(completed.avoidanceReduction).toBe(4);
    expect(completed.completedAt).not.toBeNull();
  });

  it("throws for avoidance reduction < 1", () => {
    const checkin = makeCheckin();
    expect(() => checkin.submit(0)).toThrow();
  });

  it("throws for avoidance reduction > 5", () => {
    const checkin = makeCheckin();
    expect(() => checkin.submit(6)).toThrow();
  });

  it("isExpired returns true 2 weeks after scheduled date", () => {
    const past = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    const checkin = makeCheckin({ scheduledAt: past });
    expect(checkin.isExpired(new Date())).toBe(true);
  });

  it("isExpired returns false before 2 weeks", () => {
    const recent = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const checkin = makeCheckin({ scheduledAt: recent });
    expect(checkin.isExpired(new Date())).toBe(false);
  });

  it("isExpired returns false if already completed", () => {
    const past = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    const checkin = makeCheckin({
      scheduledAt: past,
      completedAt: new Date(),
      avoidanceReduction: 3,
    });
    expect(checkin.isExpired(new Date())).toBe(false);
  });

  it("isPending returns true when not completed and not expired", () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const checkin = makeCheckin({ scheduledAt: future });
    expect(checkin.isPending(new Date())).toBe(true);
  });
});
