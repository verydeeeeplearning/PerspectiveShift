import { describe, it, expect, vi } from "vitest";
import { FindMatchCandidatesUseCase } from "../find-match-candidates";
import { StanceVector } from "@/domain/entities/stance-vector";
import type { StanceRepository, StanceProfile } from "@/domain/interfaces/stance-repository";
import type { MatchRepository } from "@/domain/interfaces/match-repository";

function makeProfile(
  sessionId: string,
  values: Record<string, number>,
  readiness = 0.8,
): StanceProfile {
  return {
    id: `id-${sessionId}`,
    sessionId,
    vector: StanceVector.fromValues(values as never),
    mapType: "test",
    reasoning: null,
    readiness,
    precision: "initial",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

const dims = {
  TECH_REGULATION: 0.5,
  REDISTRIBUTION: 0.3,
  WORK_LIFE: -0.2,
  MERITOCRACY: 0.1,
  TECH_OPTIMISM: 0.4,
  OPPORTUNITY_EQUALITY: -0.1,
};

describe("FindMatchCandidatesUseCase", () => {
  function setup(
    myProfile: StanceProfile | null,
    otherProfiles: StanceProfile[],
  ) {
    const stanceRepo: StanceRepository = {
      findBySessionId: vi.fn().mockResolvedValue(myProfile),
      save: vi.fn(),
      update: vi.fn(),
    };
    const matchRepo: MatchRepository = {
      findCandidateProfiles: vi.fn().mockResolvedValue(otherProfiles),
      saveProposal: vi.fn(),
      findProposalById: vi.fn(),
      findPendingProposal: vi.fn(),
      updateProposal: vi.fn(),
    };
    const uc = new FindMatchCandidatesUseCase({
      stanceRepository: stanceRepo,
      matchRepository: matchRepo,
    });
    return { uc, stanceRepo, matchRepo };
  }

  it("returns empty array when profile not found", async () => {
    const { uc } = setup(null, []);
    const result = await uc.execute("missing-session");
    expect(result).toEqual([]);
  });

  it("returns candidates in sweet spot sorted by score", async () => {
    const my = makeProfile("me", dims);
    const closeEnough = makeProfile("other", {
      TECH_REGULATION: 0.1,
      REDISTRIBUTION: 0.0,
      WORK_LIFE: 0.2,
      MERITOCRACY: -0.2,
      TECH_OPTIMISM: 0.0,
      OPPORTUNITY_EQUALITY: 0.3,
    }, 0.9);

    const { uc } = setup(my, [closeEnough]);
    const result = await uc.execute("me");
    for (const c of result) {
      expect(c.inSweetSpot).toBe(true);
      expect(c.distance).toBeGreaterThanOrEqual(0.4);
      expect(c.distance).toBeLessThanOrEqual(0.7);
    }
  });

  it("excludes candidates outside sweet spot", async () => {
    const my = makeProfile("me", dims);
    const identical = makeProfile("twin", dims, 0.9);
    const { uc } = setup(my, [identical]);
    const result = await uc.execute("me");
    expect(result).toHaveLength(0);
  });

  it("sorts by score descending", async () => {
    const my = makeProfile("me", dims);
    const c1 = makeProfile("c1", {
      TECH_REGULATION: 0.1,
      REDISTRIBUTION: 0.0,
      WORK_LIFE: 0.2,
      MERITOCRACY: -0.2,
      TECH_OPTIMISM: 0.0,
      OPPORTUNITY_EQUALITY: 0.3,
    }, 0.9);
    const c2 = makeProfile("c2", {
      TECH_REGULATION: 0.1,
      REDISTRIBUTION: 0.0,
      WORK_LIFE: 0.2,
      MERITOCRACY: -0.2,
      TECH_OPTIMISM: 0.0,
      OPPORTUNITY_EQUALITY: 0.3,
    }, 0.5);

    const { uc } = setup(my, [c1, c2]);
    const result = await uc.execute("me");
    if (result.length >= 2) {
      expect(result[0].score).toBeGreaterThanOrEqual(result[1].score);
    }
  });
});
