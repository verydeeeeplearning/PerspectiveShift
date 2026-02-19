import { describe, it, expect } from "vitest";
import { MatchProposal } from "../match-proposal";
import { OpinionDistance } from "../../value-objects/opinion-distance";
import { ReadinessScore } from "../../value-objects/readiness-score";
import { MatchScore } from "../../value-objects/match-score";
import { ProposalAlreadyResolvedError } from "../../errors/domain-errors";

function makeProposal(status: "PENDING" | "ACCEPTED" = "PENDING") {
  const score = MatchScore.calculate(
    OpinionDistance.create(0.55),
    ReadinessScore.create(0.8),
  );
  return MatchProposal.create({
    id: "proposal-1",
    initiatorSessionId: "session-a",
    targetSessionId: "session-b",
    score,
    status,
    expiresAt: new Date(Date.now() + 86400000),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe("MatchProposal", () => {
  it("creates with PENDING status", () => {
    const p = makeProposal();
    expect(p.status).toBe("PENDING");
  });

  it("accept changes status to ACCEPTED", () => {
    const p = makeProposal();
    p.accept();
    expect(p.status).toBe("ACCEPTED");
  });

  it("reject changes status to REJECTED", () => {
    const p = makeProposal();
    p.reject();
    expect(p.status).toBe("REJECTED");
  });

  it("expire changes status to EXPIRED", () => {
    const p = makeProposal();
    p.expire();
    expect(p.status).toBe("EXPIRED");
  });

  it("throws when accepting already resolved proposal", () => {
    const p = makeProposal();
    p.accept();
    expect(() => p.accept()).toThrow(ProposalAlreadyResolvedError);
  });

  it("throws when rejecting already resolved proposal", () => {
    const p = makeProposal();
    p.reject();
    expect(() => p.reject()).toThrow(ProposalAlreadyResolvedError);
  });

  it("isExpired detects expired PENDING proposals", () => {
    const score = MatchScore.calculate(
      OpinionDistance.create(0.55),
      ReadinessScore.create(0.8),
    );
    const p = MatchProposal.create({
      id: "p-1",
      initiatorSessionId: "a",
      targetSessionId: "b",
      score,
      status: "PENDING",
      expiresAt: new Date(Date.now() - 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(p.isExpired()).toBe(true);
  });

  it("isExpired returns false for non-expired proposal", () => {
    const p = makeProposal();
    expect(p.isExpired()).toBe(false);
  });
});
