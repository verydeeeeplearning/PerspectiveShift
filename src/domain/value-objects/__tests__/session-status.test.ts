import { describe, it, expect } from "vitest";
import {
  SESSION_STATUSES,
  isTerminal,
  isValidStatus,
} from "../session-status";

describe("SessionStatus", () => {
  it("has 4 statuses", () => {
    expect(SESSION_STATUSES).toEqual([
      "ACTIVE",
      "COMPLETED",
      "EXPIRED",
      "CANCELLED",
    ]);
  });

  it("isTerminal returns false for ACTIVE", () => {
    expect(isTerminal("ACTIVE")).toBe(false);
  });

  it("isTerminal returns true for non-ACTIVE", () => {
    expect(isTerminal("COMPLETED")).toBe(true);
    expect(isTerminal("EXPIRED")).toBe(true);
    expect(isTerminal("CANCELLED")).toBe(true);
  });

  it("isValidStatus validates correctly", () => {
    expect(isValidStatus("ACTIVE")).toBe(true);
    expect(isValidStatus("INVALID")).toBe(false);
  });
});
