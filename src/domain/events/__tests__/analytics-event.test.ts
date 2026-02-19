import { describe, it, expect } from "vitest";
import {
  PHASE1_EVENTS, PHASE2_EVENTS, PHASE3_EVENTS, ALL_EVENTS,
  createAnalyticsEvent,
  type EventMetadata,
} from "../analytics-event";

const meta: EventMetadata = {
  userId: "u-1", timestamp: Date.now(), sessionId: "s-1",
  deviceType: "mobile", appVersion: "3.0.0",
};

describe("AnalyticsEvent taxonomy", () => {
  it("has 21 Phase 1 events", () => {
    expect(PHASE1_EVENTS.length).toBe(21);
  });

  it("has 37 Phase 2 events", () => {
    expect(PHASE2_EVENTS.length).toBe(37);
  });

  it("has 10 Phase 3 events", () => {
    expect(PHASE3_EVENTS.length).toBe(10);
  });

  it("ALL_EVENTS covers 68 total events", () => {
    expect(ALL_EVENTS.length).toBe(68);
  });

  it("no duplicate event names", () => {
    const unique = new Set(ALL_EVENTS);
    expect(unique.size).toBe(ALL_EVENTS.length);
  });
});

describe("createAnalyticsEvent", () => {
  it("creates event with type, payload, and metadata", () => {
    const e = createAnalyticsEvent("MatchAccepted", { matchId: "m-1" }, meta);
    expect(e.type).toBe("MatchAccepted");
    expect(e.payload).toEqual({ matchId: "m-1" });
    expect(e.metadata.userId).toBe("u-1");
  });

  it("creates event with empty payload", () => {
    const e = createAnalyticsEvent("WarmupViewed", {}, meta);
    expect(e.type).toBe("WarmupViewed");
    expect(e.payload).toEqual({});
  });
});
