import { describe, it, expect, vi } from "vitest";
import { CheckExpiredSessionsUseCase } from "../check-expired-sessions";
import { DialogueSession } from "@/domain/entities/dialogue-session";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";

function makeSession(id: string, hoursAgo: number) {
  const lastActivity = new Date(
    Date.now() - hoursAgo * 60 * 60 * 1000,
  );
  return DialogueSession.create({
    id,
    participantA: "alice",
    participantB: "bob",
    currentStep: "POSITION",
    status: "ACTIVE",
    createdAt: lastActivity,
    updatedAt: lastActivity,
    lastActivityAt: lastActivity,
  });
}

describe("CheckExpiredSessionsUseCase", () => {
  function setup(sessions: DialogueSession[]) {
    const dialogueRepo: DialogueRepository = {
      saveSession: vi.fn(),
      findSessionById: vi.fn(),
      findSessionsByParticipant: vi.fn(),
      saveTurn: vi.fn(),
      updateSession: vi.fn(),
      findActiveSessions: vi.fn().mockResolvedValue(sessions),
    };
    const uc = new CheckExpiredSessionsUseCase({
      dialogueRepository: dialogueRepo,
    });
    return { uc, dialogueRepo };
  }

  it("expires sessions older than 48h", async () => {
    const old = makeSession("old", 49);
    const { uc, dialogueRepo } = setup([old]);
    const result = await uc.execute();
    expect(result.expired).toContain("old");
    expect(dialogueRepo.updateSession).toHaveBeenCalledOnce();
  });

  it("sends reminder for sessions 24-48h old", async () => {
    const stale = makeSession("stale", 25);
    const { uc } = setup([stale]);
    const result = await uc.execute();
    expect(result.reminded).toContain("stale");
    expect(result.expired).not.toContain("stale");
  });

  it("ignores recent sessions", async () => {
    const recent = makeSession("recent", 1);
    const { uc } = setup([recent]);
    const result = await uc.execute();
    expect(result.reminded).toHaveLength(0);
    expect(result.expired).toHaveLength(0);
  });

  it("handles mixed sessions", async () => {
    const expired = makeSession("expired", 49);
    const reminder = makeSession("reminder", 25);
    const recent = makeSession("recent", 1);
    const { uc } = setup([expired, reminder, recent]);
    const result = await uc.execute();
    expect(result.expired).toEqual(["expired"]);
    expect(result.reminded).toEqual(["reminder"]);
  });
});
