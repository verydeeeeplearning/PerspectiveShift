import { describe, it, expect } from "vitest";
import { RecordDeclineReasonUseCase } from "../record-decline-reason";

describe("RecordDeclineReasonUseCase", () => {
  const uc = new RecordDeclineReasonUseCase();

  it("records TOPIC_HEAVY and returns distance adjustment", () => {
    const result = uc.execute("TOPIC_HEAVY");
    expect(result.reason).toBe("TOPIC_HEAVY");
    expect(result.adjustment.distanceDelta).toBeLessThan(0);
  });

  it("records NO_TIME with no adjustment", () => {
    const result = uc.execute("NO_TIME");
    expect(result.reason).toBe("NO_TIME");
    expect(result.adjustment.distanceDelta).toBe(0);
  });

  it("records DIFFERENT_TOPIC with topic change flag", () => {
    const result = uc.execute("DIFFERENT_TOPIC");
    expect(result.adjustment.changeTopicFlag).toBe(true);
  });

  it("records NEED_REST with lower distance", () => {
    const result = uc.execute("NEED_REST");
    expect(result.adjustment.distanceDelta).toBeLessThan(0);
  });

  it("throws for invalid reason", () => {
    expect(() => uc.execute("INVALID" as never)).toThrow();
  });
});
