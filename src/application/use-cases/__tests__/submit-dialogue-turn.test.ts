import { describe, it, expect, vi } from "vitest";
import { SubmitDialogueTurnUseCase } from "../submit-dialogue-turn";
import { DialogueSession } from "@/domain/entities/dialogue-session";
import { DialogueTurn } from "@/domain/entities/dialogue-turn";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { PiiScrubber } from "@/domain/interfaces/pii-scrubber";
import type { Facilitator } from "@/domain/interfaces/facilitator";

function makeActiveSession() {
  const now = new Date();
  return DialogueSession.create({
    id: "session-1",
    participantA: "alice",
    participantB: "bob",
    currentStep: "POSITION",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
  });
}

describe("SubmitDialogueTurnUseCase", () => {
  function setup(session: DialogueSession | null = makeActiveSession()) {
    const dialogueRepo: DialogueRepository = {
      saveSession: vi.fn(),
      findSessionById: vi.fn().mockResolvedValue(session),
      findSessionsByParticipant: vi.fn(),
      saveTurn: vi.fn(),
      updateSession: vi.fn(),
      findActiveSessions: vi.fn(),
    };
    const piiScrubber: PiiScrubber = {
      scrub: vi.fn().mockReturnValue({
        scrubbed: "clean content",
        piiDetected: false,
        detectedTypes: [],
      }),
    };
    const facilitator: Facilitator = {
      checkTone: vi.fn().mockResolvedValue({
        passed: true,
        suggestion: null,
      }),
      checkDrift: vi.fn().mockResolvedValue({
        drifted: false,
        suggestion: null,
      }),
      suggestReceptivenessTemplate: vi.fn().mockResolvedValue([]),
      detectReceptiveExpressions: vi.fn().mockResolvedValue([]),
    };
    const uc = new SubmitDialogueTurnUseCase({
      dialogueRepository: dialogueRepo,
      piiScrubber,
      facilitator,
    });
    return { uc, dialogueRepo, piiScrubber, facilitator };
  }

  it("scrubs PII before any processing", async () => {
    const { uc, piiScrubber } = setup();
    await uc.execute("session-1", "alice", "My position with 010-1234-5678");
    expect(piiScrubber.scrub).toHaveBeenCalledWith(
      "My position with 010-1234-5678",
    );
  });

  it("checks tone after PII scrub", async () => {
    const { uc, facilitator } = setup();
    await uc.execute("session-1", "alice", "My position");
    expect(facilitator.checkTone).toHaveBeenCalledWith("clean content");
  });

  it("saves turn and updates session", async () => {
    const { uc, dialogueRepo } = setup();
    await uc.execute("session-1", "alice", "My position");
    expect(dialogueRepo.saveTurn).toHaveBeenCalledOnce();
    expect(dialogueRepo.updateSession).toHaveBeenCalledOnce();
  });

  it("returns tone/drift check results", async () => {
    const { uc, facilitator } = setup();
    (facilitator.checkTone as ReturnType<typeof vi.fn>).mockResolvedValue({
      passed: false,
      suggestion: "Please use a more respectful tone",
    });
    const result = await uc.execute("session-1", "alice", "rude content");
    expect(result.toneCheck.passed).toBe(false);
    expect(result.toneCheck.suggestion).toBeTruthy();
  });

  it("reports step advancement", async () => {
    const session = makeActiveSession();
    session.submitTurn(
      DialogueTurn.create({
        id: "existing",
        sessionId: "session-1",
        step: "POSITION",
        participantId: "alice",
        content: "existing",
        createdAt: new Date(),
      }),
    );
    const { uc } = setup(session);
    const result = await uc.execute("session-1", "bob", "My position");
    expect(result.advanced).toBe(true);
    expect(result.newStep).toBe("QUESTION");
  });

  it("throws when session not found", async () => {
    const { uc } = setup(null);
    await expect(
      uc.execute("missing", "alice", "content"),
    ).rejects.toThrow();
  });
});
