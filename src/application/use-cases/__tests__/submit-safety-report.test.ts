import { describe, it, expect, vi } from "vitest";
import { SubmitSafetyReportUseCase } from "../submit-safety-report";
import type { SafetyRepository } from "@/domain/interfaces/safety-repository";

describe("SubmitSafetyReportUseCase", () => {
  function setup() {
    const safetyRepo: SafetyRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByReporter: vi.fn(),
    };
    const uc = new SubmitSafetyReportUseCase({
      safetyRepository: safetyRepo,
    });
    return { uc, safetyRepo };
  }

  it("creates and saves a safety report", async () => {
    const { uc, safetyRepo } = setup();
    const result = await uc.execute(
      "reporter-1",
      "reported-1",
      "HARASSMENT",
      "Abusive behavior",
    );

    expect(result.reporterId).toBe("reporter-1");
    expect(result.reportedId).toBe("reported-1");
    expect(result.reason).toBe("HARASSMENT");
    expect(result.status).toBe("OPEN");
    expect(result.id).toBeTruthy();
    expect(safetyRepo.save).toHaveBeenCalledOnce();
  });

  it("accepts null description", async () => {
    const { uc } = setup();
    const result = await uc.execute(
      "reporter-1",
      "reported-1",
      "THREAT",
      null,
    );

    expect(result.reason).toBe("THREAT");
    expect(result.status).toBe("OPEN");
  });

  it("returns ISO string for createdAt", async () => {
    const { uc } = setup();
    const result = await uc.execute(
      "reporter-1",
      "reported-1",
      "PII_REQUEST",
      null,
    );

    expect(typeof result.createdAt).toBe("string");
    expect(new Date(result.createdAt).toISOString()).toBe(
      result.createdAt,
    );
  });

  it("generates unique IDs for each report", async () => {
    const { uc } = setup();
    const r1 = await uc.execute("a", "b", "OTHER", null);
    const r2 = await uc.execute("a", "b", "OTHER", null);

    expect(r1.id).not.toBe(r2.id);
  });
});
