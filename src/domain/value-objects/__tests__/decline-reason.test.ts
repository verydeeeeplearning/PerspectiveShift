import { describe, it, expect } from "vitest";
import { DeclineReason, DECLINE_REASONS } from "../decline-reason";

describe("DeclineReason", () => {
  it("defines exactly 4 reasons", () => {
    expect(DECLINE_REASONS).toHaveLength(4);
  });

  it("includes TOPIC_HEAVY reason", () => {
    const reason = DeclineReason.create("TOPIC_HEAVY");
    expect(reason.key).toBe("TOPIC_HEAVY");
    expect(reason.label).toContain("주제");
  });

  it("includes NO_TIME reason", () => {
    const reason = DeclineReason.create("NO_TIME");
    expect(reason.key).toBe("NO_TIME");
  });

  it("includes NEED_REST reason", () => {
    const reason = DeclineReason.create("NEED_REST");
    expect(reason.key).toBe("NEED_REST");
  });

  it("includes DIFFERENT_TOPIC reason", () => {
    const reason = DeclineReason.create("DIFFERENT_TOPIC");
    expect(reason.key).toBe("DIFFERENT_TOPIC");
  });

  it("TOPIC_HEAVY suggests lower distance next time", () => {
    const reason = DeclineReason.create("TOPIC_HEAVY");
    const adj = reason.toMatchingAdjustment();
    expect(adj.distanceDelta).toBeLessThan(0);
  });

  it("DIFFERENT_TOPIC suggests topic change", () => {
    const reason = DeclineReason.create("DIFFERENT_TOPIC");
    const adj = reason.toMatchingAdjustment();
    expect(adj.changeTopicFlag).toBe(true);
  });

  it("NO_TIME suggests no matching parameter change", () => {
    const reason = DeclineReason.create("NO_TIME");
    const adj = reason.toMatchingAdjustment();
    expect(adj.distanceDelta).toBe(0);
  });

  it("throws for invalid reason", () => {
    expect(() => DeclineReason.create("INVALID" as never)).toThrow();
  });
});
