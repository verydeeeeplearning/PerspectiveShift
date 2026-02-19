import { describe, it, expect } from "vitest";
import { SafetyReport } from "../safety-report";

function makeReport(
  overrides: Partial<{
    status: "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED";
  }> = {},
) {
  return SafetyReport.create({
    id: "report-1",
    reporterId: "reporter-1",
    reportedId: "reported-1",
    reason: "HARASSMENT",
    description: "Abusive language in dialogue",
    status: overrides.status ?? "OPEN",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  });
}

describe("SafetyReport", () => {
  it("creates with given properties", () => {
    const report = makeReport();
    expect(report.id).toBe("report-1");
    expect(report.reporterId).toBe("reporter-1");
    expect(report.reportedId).toBe("reported-1");
    expect(report.reason).toBe("HARASSMENT");
    expect(report.description).toBe("Abusive language in dialogue");
    expect(report.status).toBe("OPEN");
  });

  it("allows null description", () => {
    const report = SafetyReport.create({
      id: "report-2",
      reporterId: "r1",
      reportedId: "r2",
      reason: "OTHER",
      description: null,
      status: "OPEN",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(report.description).toBeNull();
  });

  it("transitions to REVIEWING", () => {
    const report = makeReport();
    report.markReviewing();
    expect(report.status).toBe("REVIEWING");
    expect(report.updatedAt.getTime()).toBeGreaterThanOrEqual(
      new Date("2026-01-01").getTime(),
    );
  });

  it("transitions to RESOLVED", () => {
    const report = makeReport();
    report.resolve();
    expect(report.status).toBe("RESOLVED");
  });

  it("transitions to DISMISSED", () => {
    const report = makeReport();
    report.dismiss();
    expect(report.status).toBe("DISMISSED");
  });
});
