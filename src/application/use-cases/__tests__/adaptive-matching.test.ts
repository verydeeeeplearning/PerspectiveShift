import { describe, it, expect, vi } from "vitest";
import { FindMatchCandidatesUseCase } from "../find-match-candidates";
import { StanceVector } from "@/domain/entities/stance-vector";
import type { StanceRepository, StanceProfile } from "@/domain/interfaces/stance-repository";
import type { MatchRepository } from "@/domain/interfaces/match-repository";
import type { PersonaRepository } from "@/domain/interfaces/persona-repository";

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

const myDims = {
  TECH_REGULATION: 0.5,
  REDISTRIBUTION: 0.3,
  WORK_LIFE: -0.2,
  MERITOCRACY: 0.1,
  TECH_OPTIMISM: 0.4,
  OPPORTUNITY_EQUALITY: -0.1,
};

// Profile with moderate distance (~0.3-0.4)
const closeCandidate = makeProfile("close", {
  TECH_REGULATION: 0.2,
  REDISTRIBUTION: 0.1,
  WORK_LIFE: 0.0,
  MERITOCRACY: -0.1,
  TECH_OPTIMISM: 0.2,
  OPPORTUNITY_EQUALITY: 0.1,
}, 0.9);

// Profile with larger distance (~0.5-0.7)
const farCandidate = makeProfile("far", {
  TECH_REGULATION: -0.3,
  REDISTRIBUTION: -0.2,
  WORK_LIFE: 0.5,
  MERITOCRACY: -0.4,
  TECH_OPTIMISM: -0.2,
  OPPORTUNITY_EQUALITY: 0.5,
}, 0.9);

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
  const personaRepo: PersonaRepository = {
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
  };
  const uc = new FindMatchCandidatesUseCase({
    stanceRepository: stanceRepo,
    matchRepository: matchRepo,
    personaRepository: personaRepo,
  });
  return { uc, stanceRepo, matchRepo };
}

describe("Adaptive Matching", () => {
  it("first dialogue uses LOW band (0.2-0.4)", async () => {
    const my = makeProfile("me", myDims);
    const { uc } = setup(my, [closeCandidate, farCandidate]);

    const result = await uc.execute("me", {
      isFirstDialogue: true,
      confidence: 0.5,
      fatigue: 0,
      recentSatisfaction: 0.5,
    });

    expect(result.bandMin).toBe(0.2);
    expect(result.bandMax).toBe(0.4);
    expect(result.topicLevelMax).toBeLessThanOrEqual(1);
  });

  it("returns adaptive result with band info", async () => {
    const my = makeProfile("me", myDims, 0.6);
    const { uc } = setup(my, [closeCandidate]);

    const result = await uc.execute("me", {
      confidence: 0.5,
      fatigue: 0.3,
      isFirstDialogue: false,
      recentSatisfaction: 0.6,
    });

    expect(result).toHaveProperty("bandMin");
    expect(result).toHaveProperty("bandMax");
    expect(result).toHaveProperty("facilitatorIntensity");
    expect(result).toHaveProperty("reflectionLevel");
    expect(result).toHaveProperty("candidates");
  });

  it("returns empty adaptive result when profile not found", async () => {
    const { uc } = setup(null, []);
    const result = await uc.execute("missing", {
      isFirstDialogue: true,
    });

    expect(result.candidates).toEqual([]);
  });

  it("backward compatible: execute(sessionId) returns flat array", async () => {
    const my = makeProfile("me", myDims);
    const { uc } = setup(my, [closeCandidate]);

    const result = await uc.execute("me");
    expect(Array.isArray(result)).toBe(true);
  });
});
