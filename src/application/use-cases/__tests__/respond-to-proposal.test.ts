import { describe, it, expect, vi } from "vitest";
import { RespondToProposalUseCase } from "../respond-to-proposal";
import { MatchProposal } from "@/domain/entities/match-proposal";
import { OpinionDistance } from "@/domain/value-objects/opinion-distance";
import { ReadinessScore } from "@/domain/value-objects/readiness-score";
import { MatchScore } from "@/domain/value-objects/match-score";
import {
  UnauthorizedParticipantError,
  ProposalAlreadyResolvedError,
} from "@/domain/errors/domain-errors";
import type { MatchRepository } from "@/domain/interfaces/match-repository";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";

function makeProposal(overrides: { status?: "PENDING" | "ACCEPTED"; expired?: boolean } = {}) {
  const score = MatchScore.calculate(
    OpinionDistance.create(0.55),
    ReadinessScore.create(0.8),
  );
  return MatchProposal.create({
    id: "proposal-1",
    initiatorSessionId: "initiator",
    targetSessionId: "target",
    score,
    status: overrides.status ?? "PENDING",
    expiresAt: overrides.expired
      ? new Date(Date.now() - 1000)
      : new Date(Date.now() + 86400000),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe("RespondToProposalUseCase", () => {
  function setup(proposal: MatchProposal | null = makeProposal()) {
    const matchRepo: MatchRepository = {
      findCandidateProfiles: vi.fn(),
      saveProposal: vi.fn(),
      findProposalById: vi.fn().mockResolvedValue(proposal),
      findPendingProposal: vi.fn(),
      updateProposal: vi.fn(),
    };
    const dialogueRepo: DialogueRepository = {
      saveSession: vi.fn(),
      findSessionById: vi.fn(),
      findSessionsByParticipant: vi.fn(),
      saveTurn: vi.fn(),
      updateSession: vi.fn(),
      findActiveSessions: vi.fn(),
    };
    const uc = new RespondToProposalUseCase({
      matchRepository: matchRepo,
      dialogueRepository: dialogueRepo,
    });
    return { uc, matchRepo, dialogueRepo };
  }

  it("creates dialogue session on accept", async () => {
    const { uc, dialogueRepo } = setup();
    const result = await uc.execute("proposal-1", "target", true);
    expect(result.status).toBe("ACCEPTED");
    expect(result.dialogueSessionId).toBeTruthy();
    expect(dialogueRepo.saveSession).toHaveBeenCalledOnce();
  });

  it("does not create session on reject", async () => {
    const { uc, dialogueRepo } = setup();
    const result = await uc.execute("proposal-1", "target", false);
    expect(result.status).toBe("REJECTED");
    expect(result.dialogueSessionId).toBeNull();
    expect(dialogueRepo.saveSession).not.toHaveBeenCalled();
  });

  it("throws UnauthorizedParticipantError if not target", async () => {
    const { uc } = setup();
    await expect(
      uc.execute("proposal-1", "not-target", true),
    ).rejects.toThrow(UnauthorizedParticipantError);
  });

  it("throws when proposal not found", async () => {
    const { uc } = setup(null);
    await expect(
      uc.execute("proposal-1", "target", true),
    ).rejects.toThrow();
  });

  it("handles expired proposal", async () => {
    const expired = makeProposal({ expired: true });
    const { uc } = setup(expired);
    const result = await uc.execute("proposal-1", "target", true);
    expect(result.status).toBe("EXPIRED");
    expect(result.dialogueSessionId).toBeNull();
  });

  it("throws ProposalAlreadyResolvedError for resolved proposal", async () => {
    const accepted = makeProposal({ status: "ACCEPTED" });
    const { uc } = setup(accepted);
    await expect(
      uc.execute("proposal-1", "target", true),
    ).rejects.toThrow(ProposalAlreadyResolvedError);
  });
});
