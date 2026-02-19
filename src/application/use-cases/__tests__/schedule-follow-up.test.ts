import { describe, it, expect, vi } from "vitest";
import { ScheduleFollowUpUseCase } from "../schedule-follow-up";
import type { FollowUpCheckinRepository } from "@/domain/interfaces/follow-up-checkin-repository";

function mockRepo(): FollowUpCheckinRepository {
  return {
    save: vi.fn(),
    findById: vi.fn(),
    findBySessionAndParticipant: vi.fn().mockResolvedValue(null),
    findPendingByParticipant: vi.fn().mockResolvedValue([]),
    update: vi.fn(),
  };
}

describe("ScheduleFollowUpUseCase", () => {
  it("creates follow-up checkin scheduled 1 day later", async () => {
    const repo = mockRepo();
    const uc = new ScheduleFollowUpUseCase({ followUpRepository: repo });
    const result = await uc.execute("session-1", "alice");

    expect(result.dialogueSessionId).toBe("session-1");
    expect(result.participantId).toBe("alice");
    const scheduledAt = new Date(result.scheduledAt);
    const now = Date.now();
    const diff = scheduledAt.getTime() - now;
    // Should be approximately 1 day (within 1 minute tolerance)
    expect(diff).toBeGreaterThan(0.99 * 24 * 60 * 60 * 1000);
    expect(diff).toBeLessThan(1.01 * 24 * 60 * 60 * 1000);
    expect(repo.save).toHaveBeenCalledOnce();
  });

  it("does not schedule duplicate for same session+participant", async () => {
    const repo = mockRepo();
    (repo.findBySessionAndParticipant as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "existing",
    });
    const uc = new ScheduleFollowUpUseCase({ followUpRepository: repo });

    await expect(uc.execute("session-1", "alice")).rejects.toThrow();
  });
});
