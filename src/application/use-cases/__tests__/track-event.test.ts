import { describe, it, expect, vi } from "vitest";
import { TrackEventUseCase } from "../track-event";
import type { EventEmitter } from "@/domain/interfaces/event-emitter";
import type { EventMetadata } from "@/domain/events/analytics-event";

const meta: EventMetadata = {
  userId: "u-1", timestamp: Date.now(), sessionId: "s-1",
  deviceType: "mobile", appVersion: "3.0.0",
};

describe("TrackEventUseCase", () => {
  it("emits event via EventEmitter", () => {
    const emitter: EventEmitter = { emit: vi.fn() };
    const uc = new TrackEventUseCase({ eventEmitter: emitter });
    const result = uc.execute({ type: "MatchAccepted", payload: { matchId: "m-1" }, metadata: meta });
    expect(emitter.emit).toHaveBeenCalledTimes(1);
    expect(result.type).toBe("MatchAccepted");
  });

  it("attaches metadata to the event", () => {
    const emitter: EventEmitter = { emit: vi.fn() };
    const uc = new TrackEventUseCase({ eventEmitter: emitter });
    const result = uc.execute({ type: "WarmupViewed", payload: {}, metadata: meta });
    expect(result.metadata.userId).toBe("u-1");
  });
});
