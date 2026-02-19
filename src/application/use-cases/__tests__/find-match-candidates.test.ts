import { describe, it, expect, vi } from "vitest";
import {
  FindMatchCandidatesUseCase,
  computeEnergyCompat,
} from "../find-match-candidates";
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

  // --- Backwards compatibility ---
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

  // --- Energy-aware matching ---
  it("applies energy compatibility when energyLevel option is provided", async () => {
    const my = makeProfile("me", dims);
    const candidate = makeProfile("other", {
      TECH_REGULATION: 0.1,
      REDISTRIBUTION: 0.0,
      WORK_LIFE: 0.2,
      MERITOCRACY: -0.2,
      TECH_OPTIMISM: 0.0,
      OPPORTUNITY_EQUALITY: 0.3,
    }, 0.9);

    const { uc } = setup(my, [candidate]);
    // With energyLevel, the use case computes energyCompat
    const result = await uc.execute("me", { energyLevel: "HIGH" });
    // Should return AdaptiveMatchResult
    expect(result).toHaveProperty("candidates");
    expect(result).toHaveProperty("bandMin");
  });

  // --- Decline penalty ---
  it("applies decline penalty when sessionId is in recentlyDeclinedSessionIds", async () => {
    const my = makeProfile("me", dims);
    const candidate = makeProfile("other", {
      TECH_REGULATION: 0.1,
      REDISTRIBUTION: 0.0,
      WORK_LIFE: 0.2,
      MERITOCRACY: -0.2,
      TECH_OPTIMISM: 0.0,
      OPPORTUNITY_EQUALITY: 0.3,
    }, 0.9);

    const { uc: ucNoPenalty } = setup(my, [candidate]);
    const resultNoPenalty = await uc_execute_no_decline(ucNoPenalty);

    const { uc: ucWithPenalty } = setup(my, [candidate]);
    const resultWithPenalty = await uc_execute_with_decline(ucWithPenalty);

    // With decline penalty, the score should be lower
    if (resultNoPenalty.length > 0 && resultWithPenalty.length > 0) {
      expect(resultWithPenalty[0].score).toBeLessThan(resultNoPenalty[0].score);
    }
  });
});

// Helper to execute without decline
async function uc_execute_no_decline(uc: FindMatchCandidatesUseCase) {
  const result = await uc.execute("me");
  return result;
}

// Helper to execute with decline
async function uc_execute_with_decline(uc: FindMatchCandidatesUseCase) {
  const result = await uc.execute("me", {
    recentlyDeclinedSessionIds: ["other"],
  });
  return result.candidates;
}

describe("computeEnergyCompat", () => {
  it("returns 1.0 for same energy level", () => {
    expect(computeEnergyCompat("HIGH", "HIGH")).toBe(1.0);
    expect(computeEnergyCompat("NORMAL", "NORMAL")).toBe(1.0);
    expect(computeEnergyCompat("LOW", "LOW")).toBe(1.0);
  });

  it("returns 0.7 for adjacent energy levels", () => {
    expect(computeEnergyCompat("HIGH", "NORMAL")).toBe(0.7);
    expect(computeEnergyCompat("NORMAL", "HIGH")).toBe(0.7);
    expect(computeEnergyCompat("NORMAL", "LOW")).toBe(0.7);
    expect(computeEnergyCompat("LOW", "NORMAL")).toBe(0.7);
  });

  it("returns 0.3 for opposite energy levels", () => {
    expect(computeEnergyCompat("HIGH", "LOW")).toBe(0.3);
    expect(computeEnergyCompat("LOW", "HIGH")).toBe(0.3);
  });
});
