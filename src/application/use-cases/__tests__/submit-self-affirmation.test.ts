import { describe, it, expect, vi } from "vitest";
import { SubmitSelfAffirmationUseCase } from "../submit-self-affirmation";
import type { StanceRepository, StanceProfile } from "@/domain/interfaces/stance-repository";
import type { ValueExtractor } from "@/domain/interfaces/value-extractor";
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

describe("SubmitSelfAffirmationUseCase", () => {
  function setup(opts: { profileExists?: boolean } = {}) {
    const stanceRepo: StanceRepository = {
      findBySessionId: vi.fn().mockResolvedValue(
        opts.profileExists !== false ? makeProfile("sess-1") : null,
      ),
      save: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
    };

    const valueExtractor: ValueExtractor = {
      extractValuePriority: vi.fn().mockResolvedValue(["성장", "도전"]),
    };

    const useCase = new SubmitSelfAffirmationUseCase(stanceRepo, valueExtractor);

    return { stanceRepo, valueExtractor, useCase };
  }

  it("updates StanceProfile with coreValue and experience", async () => {
    const { stanceRepo, valueExtractor, useCase } = setup();

    await useCase.execute({
      sessionId: "sess-1",
      coreValue: "FAIRNESS",
      experience: "공정한 판단을 내린 경험",
    });

    expect(stanceRepo.update).toHaveBeenCalledWith("sess-1", {
      coreValue: "FAIRNESS",
      selfAffirmationExperience: "공정한 판단을 내린 경험",
    });
    expect(valueExtractor.extractValuePriority).toHaveBeenCalledWith(
      "공정한 판단을 내린 경험",
    );
  });

  it("updates StanceProfile with coreValue only (no experience)", async () => {
    const { stanceRepo, valueExtractor, useCase } = setup();

    await useCase.execute({
      sessionId: "sess-1",
      coreValue: "GROWTH",
    });

    expect(stanceRepo.update).toHaveBeenCalledWith("sess-1", {
      coreValue: "GROWTH",
      selfAffirmationExperience: null,
    });
    expect(valueExtractor.extractValuePriority).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when session does not exist", async () => {
    const { useCase } = setup({ profileExists: false });

    await expect(
      useCase.execute({
        sessionId: "nonexistent",
        coreValue: "CARING",
      }),
    ).rejects.toThrow("not found");
  });

  it("handles ValueExtractor failure gracefully", async () => {
    const { stanceRepo, valueExtractor, useCase } = setup();
    (valueExtractor.extractValuePriority as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("LLM API error"),
    );

    // Should not throw — LLM extraction is best-effort
    await useCase.execute({
      sessionId: "sess-1",
      coreValue: "TRUTH",
      experience: "진실을 말한 경험",
    });

    expect(stanceRepo.update).toHaveBeenCalledWith("sess-1", {
      coreValue: "TRUTH",
      selfAffirmationExperience: "진실을 말한 경험",
    });
  });
});
