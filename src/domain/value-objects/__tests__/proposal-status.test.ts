import { describe, it, expect } from "vitest";
import {
  PROPOSAL_STATUSES,
  isResolved,
  isValidProposalStatus,
} from "../proposal-status";

describe("ProposalStatus", () => {
  it("has 4 statuses", () => {
    expect(PROPOSAL_STATUSES).toEqual([
      "PENDING",
      "ACCEPTED",
      "REJECTED",
      "EXPIRED",
    ]);
  });

  it("isResolved returns false for PENDING", () => {
    expect(isResolved("PENDING")).toBe(false);
  });

  it("isResolved returns true for resolved statuses", () => {
    expect(isResolved("ACCEPTED")).toBe(true);
    expect(isResolved("REJECTED")).toBe(true);
    expect(isResolved("EXPIRED")).toBe(true);
  });

  it("isValidProposalStatus validates correctly", () => {
    expect(isValidProposalStatus("PENDING")).toBe(true);
    expect(isValidProposalStatus("NOPE")).toBe(false);
  });
});
