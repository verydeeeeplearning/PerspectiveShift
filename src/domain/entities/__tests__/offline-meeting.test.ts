import { describe, it, expect } from "vitest";
import { OfflineMeeting } from "../offline-meeting";
import { MeetingAlreadyResolvedError } from "../../errors/domain-errors";

function makeMeeting(
  status: "PROPOSED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" = "PROPOSED",
) {
  return OfflineMeeting.create({
    id: "m-1",
    friendshipId: "f-1",
    proposerId: "user-a",
    status,
    safetyCheckinStatus: "PENDING",
    proposedAt: new Date(),
    locationHint: "강남역 카페",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe("OfflineMeeting", () => {
  it("creates with PROPOSED status", () => {
    const m = makeMeeting();
    expect(m.status).toBe("PROPOSED");
    expect(m.safetyCheckinStatus).toBe("PENDING");
  });

  it("confirm changes status to CONFIRMED", () => {
    const m = makeMeeting();
    m.confirm();
    expect(m.status).toBe("CONFIRMED");
  });

  it("cancel changes status to CANCELLED", () => {
    const m = makeMeeting();
    m.cancel();
    expect(m.status).toBe("CANCELLED");
  });

  it("complete from CONFIRMED changes status to COMPLETED", () => {
    const m = makeMeeting("CONFIRMED");
    m.complete();
    expect(m.status).toBe("COMPLETED");
  });

  it("throws on confirm when not PROPOSED", () => {
    const m = makeMeeting("CONFIRMED");
    expect(() => m.confirm()).toThrow(MeetingAlreadyResolvedError);
  });

  it("throws on cancel when already cancelled", () => {
    const m = makeMeeting("CANCELLED");
    expect(() => m.cancel()).toThrow(MeetingAlreadyResolvedError);
  });

  it("throws on complete when not CONFIRMED", () => {
    const m = makeMeeting("PROPOSED");
    expect(() => m.complete()).toThrow(MeetingAlreadyResolvedError);
  });

  it("submitCheckin updates safety status", () => {
    const m = makeMeeting("CONFIRMED");
    m.submitCheckin("SAFE");
    expect(m.safetyCheckinStatus).toBe("SAFE");
  });

  it("preserves location hint", () => {
    const m = makeMeeting();
    expect(m.locationHint).toBe("강남역 카페");
  });
});
