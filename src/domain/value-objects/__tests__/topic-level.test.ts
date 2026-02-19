import { describe, it, expect } from "vitest";
import {
  TopicLevel,
  TOPIC_LEVELS,
  type TopicLevelKey,
} from "../topic-level";

describe("TopicLevel", () => {
  it("creates Level 0 (일상 가치/경험)", () => {
    const level = TopicLevel.create(0);
    expect(level.level).toBe(0);
    expect(level.label).toBe("일상 가치/경험");
    expect(level.risk).toBe("LOW");
  });

  it("creates Level 1 (정책 메커니즘)", () => {
    const level = TopicLevel.create(1);
    expect(level.level).toBe(1);
    expect(level.label).toBe("정책 메커니즘");
    expect(level.risk).toBe("LOW");
  });

  it("creates Level 2 (가치 충돌)", () => {
    const level = TopicLevel.create(2);
    expect(level.level).toBe(2);
    expect(level.label).toBe("가치 충돌");
    expect(level.risk).toBe("MEDIUM");
  });

  it("creates Level 3 (정체성 직결)", () => {
    const level = TopicLevel.create(3);
    expect(level.level).toBe(3);
    expect(level.label).toBe("정체성 직결");
    expect(level.risk).toBe("HIGH");
  });

  it("throws for invalid level", () => {
    expect(() => TopicLevel.create(-1)).toThrow();
    expect(() => TopicLevel.create(4)).toThrow();
    expect(() => TopicLevel.create(1.5)).toThrow();
  });

  it("checks isAllowedIn range", () => {
    const level2 = TopicLevel.create(2);
    expect(level2.isAllowedIn(0, 3)).toBe(true);
    expect(level2.isAllowedIn(0, 1)).toBe(false);
    expect(level2.isAllowedIn(2, 3)).toBe(true);
  });

  it("has all 4 levels defined", () => {
    expect(Object.keys(TOPIC_LEVELS)).toHaveLength(4);
  });
});
