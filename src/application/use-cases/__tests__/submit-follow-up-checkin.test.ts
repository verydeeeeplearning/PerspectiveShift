import { describe, it, expect, vi } from "vitest";
import { SubmitFollowUpCheckinUseCase } from "../submit-follow-up-checkin";
import { FollowUpCheckin } from "@/domain/entities/follow-up-checkin";
import type { FollowUpCheckinRepository } from "@/domain/interfaces/follow-up-checkin-repository";

function makePendingCheckin(): FollowUpCheckin {
  return FollowUpCheckin.create({
    id: "checkin-1",
    dialogueSessionId: "session-1",
    participantId: "alice",
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    avoidanceReduction: null,
    completedAt: null,
    createdAt: new Date(),
  });
}

function makeExpiredCheckin(): FollowUpCheckin {
  return FollowUpCheckin.create({
    id: "checkin-2",
    dialogueSessionId: "session-1",
    participantId: "alice",
    scheduledAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    avoidanceReduction: null,
    completedAt: null,
    createdAt: new Date(),
  });
}

function mockRepo(checkin: FollowUpCheckin | null): FollowUpCheckinRepository {
  return {
    save: vi.fn(),
    findById: vi.fn().mockResolvedValue(checkin),
    findBySessionAndParticipant: vi.fn(),
    findPendingByParticipant: vi.fn().mockResolvedValue([]),
    update: vi.fn(),
  };
}

describe("SubmitFollowUpCheckinUseCase", () => {
  it("submits avoidance reduction score", async () => {
    const repo = mockRepo(makePendingCheckin());
    const uc = new SubmitFollowUpCheckinUseCase({ followUpRepository: repo });
    const result = await uc.execute("checkin-1", 4);
    expect(result.avoidanceReduction).toBe(4);
    expect(result.completedAt).not.toBeNull();
    expect(repo.update).toHaveBeenCalledOnce();
  });

  it("throws for expired checkin", async () => {
    const repo = mockRepo(makeExpiredCheckin());
    const uc = new SubmitFollowUpCheckinUseCase({ followUpRepository: repo });
    await expect(uc.execute("checkin-2", 3)).rejects.toThrow();
  });

  it("throws for non-existent checkin", async () => {
    const repo = mockRepo(null);
    const uc = new SubmitFollowUpCheckinUseCase({ followUpRepository: repo });
    await expect(uc.execute("missing", 3)).rejects.toThrow();
  });
});
