import { describe, it, expect, vi } from "vitest";
import { CreateMatchProposalUseCase } from "../create-match-proposal";
import { StanceVector } from "@/domain/entities/stance-vector";
import { DuplicateProposalError } from "@/domain/errors/domain-errors";
import type { StanceRepository, StanceProfile } from "@/domain/interfaces/stance-repository";
import type { MatchRepository } from "@/domain/interfaces/match-repository";

const dims = {
  TECH_REGULATION: 0.5,
  REDISTRIBUTION: 0.3,
  WORK_LIFE: -0.2,
  MERITOCRACY: 0.1,
  TECH_OPTIMISM: 0.4,
  OPPORTUNITY_EQUALITY: -0.1,
};

function makeProfile(sessionId: string, overrides: Record<string, number> = {}): StanceProfile {
  return {
    id: `id-${sessionId}`,
    sessionId,
    vector: StanceVector.fromValues({ ...dims, ...overrides } as never),
    mapType: "test",
    reasoning: null,
    readiness: 0.8,
    precision: "initial",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("CreateMatchProposalUseCase", () => {
  function setup(opts: {
    pendingExists?: boolean;
    initiatorProfile?: StanceProfile | null;
    targetProfile?: StanceProfile | null;
  } = {}) {
    const stanceRepo: StanceRepository = {
      findBySessionId: vi.fn().mockImplementation((id: string) => {
        if (id === "initiator") {
          return "initiatorProfile" in opts ? opts.initiatorProfile : makeProfile("initiator");
        }
        if (id === "target") {
          return "targetProfile" in opts ? opts.targetProfile : makeProfile("target", { TECH_REGULATION: -0.3 });
        }
        return null;
      }),
      save: vi.fn(),
      update: vi.fn(),
    };
    const matchRepo: MatchRepository = {
      findCandidateProfiles: vi.fn(),
      saveProposal: vi.fn(),
      findProposalById: vi.fn(),
      findPendingProposal: vi.fn().mockResolvedValue(
        opts.pendingExists ? { id: "existing" } : null,
      ),
      updateProposal: vi.fn(),
    };
    const uc = new CreateMatchProposalUseCase({
      stanceRepository: stanceRepo,
      matchRepository: matchRepo,
    });
    return { uc, stanceRepo, matchRepo };
  }

  it("creates proposal with score and expiry", async () => {
    const { uc, matchRepo } = setup();
    const result = await uc.execute("initiator", "target");
    expect(result.initiatorSessionId).toBe("initiator");
    expect(result.targetSessionId).toBe("target");
    expect(result.status).toBe("PENDING");
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(matchRepo.saveProposal).toHaveBeenCalledOnce();
  });

  it("throws DuplicateProposalError when pending exists", async () => {
    const { uc } = setup({ pendingExists: true });
    await expect(uc.execute("initiator", "target")).rejects.toThrow(
      DuplicateProposalError,
    );
  });

  it("throws when initiator profile not found", async () => {
    const { uc } = setup({ initiatorProfile: null });
    await expect(uc.execute("initiator", "target")).rejects.toThrow();
  });

  it("sets expiry 48h from now", async () => {
    const { uc } = setup();
    const before = Date.now();
    const result = await uc.execute("initiator", "target");
    const expiresAt = new Date(result.expiresAt).getTime();
    const expectedMin = before + 48 * 60 * 60 * 1000 - 1000;
    const expectedMax = before + 48 * 60 * 60 * 1000 + 1000;
    expect(expiresAt).toBeGreaterThanOrEqual(expectedMin);
    expect(expiresAt).toBeLessThanOrEqual(expectedMax);
  });
});
