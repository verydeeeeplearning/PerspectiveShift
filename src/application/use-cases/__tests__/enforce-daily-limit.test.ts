import { describe, it, expect, vi } from "vitest";
import { EnforceDailyLimitUseCase } from "../enforce-daily-limit";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";

function mockRepo(todayCount: number): DialogueRepository {
  const sessions = Array.from({ length: todayCount }, () => ({}));
  return {
    saveSession: vi.fn(),
    findSessionById: vi.fn(),
    findSessionsByParticipant: vi.fn().mockResolvedValue(sessions),
    saveTurn: vi.fn(),
    updateSession: vi.fn(),
    findActiveSessions: vi.fn(),
  };
}

describe("EnforceDailyLimitUseCase", () => {
  it("allows when under limit", async () => {
    const uc = new EnforceDailyLimitUseCase({ dialogueRepository: mockRepo(1) });
    const result = await uc.execute("alice");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("blocks when at limit", async () => {
    const uc = new EnforceDailyLimitUseCase({ dialogueRepository: mockRepo(2) });
    const result = await uc.execute("alice");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("returns cooldown info when blocked", async () => {
    const uc = new EnforceDailyLimitUseCase({ dialogueRepository: mockRepo(3) });
    const result = await uc.execute("alice");
    expect(result.cooldown).toBeDefined();
    expect(result.cooldown!.reason).toBe("DAILY_LIMIT");
  });
});
