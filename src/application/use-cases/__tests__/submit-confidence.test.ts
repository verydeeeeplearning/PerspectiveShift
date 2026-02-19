import { describe, it, expect, vi } from "vitest";
import { SubmitConfidenceUseCase } from "../submit-confidence";
import type { StanceRepository, StanceProfile } from "@/domain/interfaces/stance-repository";
import { StanceVector } from "@/domain/entities/stance-vector";

function makeProfile(sessionId: string): StanceProfile {
  return {
    id: `id-${sessionId}`,
    sessionId,
    vector: StanceVector.fromValues({
      TECH_REGULATION: 0.5,
      REDISTRIBUTION: 0.3,
      WORK_LIFE: 0.1,
      MERITOCRACY: -0.2,
      TECH_OPTIMISM: 0.4,
      OPPORTUNITY_EQUALITY: 0.2,
    }),
    mapType: "BALANCE_SEEKER",
    reasoning: null,
    readiness: 0.5,
    precision: "initial",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("SubmitConfidenceUseCase", () => {
  function setup(opts: { profileExists?: boolean } = {}) {
    const stanceRepo: StanceRepository = {
      findBySessionId: vi.fn().mockResolvedValue(
        opts.profileExists !== false ? makeProfile("sess-1") : null,
      ),
      save: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new SubmitConfidenceUseCase(stanceRepo);
    return { stanceRepo, useCase };
  }

  it("updates confidence map with high confidence dimensions", async () => {
    const { stanceRepo, useCase } = setup();

    await useCase.execute({
      sessionId: "sess-1",
      highConfidenceDimensions: ["TECH_REGULATION", "MERITOCRACY"],
    });

    expect(stanceRepo.update).toHaveBeenCalledWith("sess-1", {
      confidenceMap: expect.objectContaining({
        TECH_REGULATION: "HIGH",
        MERITOCRACY: "HIGH",
        REDISTRIBUTION: "MEDIUM",
        WORK_LIFE: "MEDIUM",
        TECH_OPTIMISM: "MEDIUM",
        OPPORTUNITY_EQUALITY: "MEDIUM",
      }),
    });
  });

  it("sets all dimensions to MEDIUM when no high confidence", async () => {
    const { stanceRepo, useCase } = setup();

    await useCase.execute({
      sessionId: "sess-1",
      highConfidenceDimensions: [],
    });

    expect(stanceRepo.update).toHaveBeenCalledWith("sess-1", {
      confidenceMap: expect.objectContaining({
        TECH_REGULATION: "MEDIUM",
        REDISTRIBUTION: "MEDIUM",
        WORK_LIFE: "MEDIUM",
        MERITOCRACY: "MEDIUM",
        TECH_OPTIMISM: "MEDIUM",
        OPPORTUNITY_EQUALITY: "MEDIUM",
      }),
    });
  });

  it("throws when session not found", async () => {
    const { useCase } = setup({ profileExists: false });

    await expect(
      useCase.execute({
        sessionId: "nonexistent",
        highConfidenceDimensions: [],
      }),
    ).rejects.toThrow("not found");
  });
});
