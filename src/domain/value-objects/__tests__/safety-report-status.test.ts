import { describe, it, expect } from "vitest";
import {
  SAFETY_REPORT_STATUSES,
  isValidSafetyReportStatus,
} from "../safety-report-status";

describe("SafetyReportStatus", () => {
  it("has four valid statuses", () => {
    expect(SAFETY_REPORT_STATUSES).toHaveLength(4);
    expect(SAFETY_REPORT_STATUSES).toContain("OPEN");
    expect(SAFETY_REPORT_STATUSES).toContain("REVIEWING");
    expect(SAFETY_REPORT_STATUSES).toContain("RESOLVED");
    expect(SAFETY_REPORT_STATUSES).toContain("DISMISSED");
  });

  describe("isValidSafetyReportStatus", () => {
    it("validates known statuses", () => {
      expect(isValidSafetyReportStatus("OPEN")).toBe(true);
      expect(isValidSafetyReportStatus("REVIEWING")).toBe(true);
      expect(isValidSafetyReportStatus("RESOLVED")).toBe(true);
      expect(isValidSafetyReportStatus("DISMISSED")).toBe(true);
    });

    it("rejects unknown statuses", () => {
      expect(isValidSafetyReportStatus("PENDING")).toBe(false);
      expect(isValidSafetyReportStatus("")).toBe(false);
    });
  });
});
