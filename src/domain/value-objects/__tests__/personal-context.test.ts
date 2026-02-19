import { describe, it, expect } from "vitest";
import { PersonalContext } from "../personal-context";

describe("PersonalContext", () => {
  it("creates with scrubbed text", () => {
    const ctx = PersonalContext.create("저는 [REDACTED]에서 근무하면서 느꼈습니다");
    expect(ctx.scrubbedText).toBe("저는 [REDACTED]에서 근무하면서 느꼈습니다");
  });

  it("allows empty string (no context provided)", () => {
    const ctx = PersonalContext.create("");
    expect(ctx.scrubbedText).toBe("");
    expect(ctx.isEmpty()).toBe(true);
  });

  it("non-empty context returns isEmpty false", () => {
    const ctx = PersonalContext.create("개인적 경험입니다");
    expect(ctx.isEmpty()).toBe(false);
  });

  it("trims whitespace", () => {
    const ctx = PersonalContext.create("  맥락  ");
    expect(ctx.scrubbedText).toBe("맥락");
  });

  it("throws if too long", () => {
    const longText = "a".repeat(501);
    expect(() => PersonalContext.create(longText)).toThrow();
  });
});
