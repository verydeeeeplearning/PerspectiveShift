import { describe, it, expect } from "vitest";
import { DialogueLimit } from "../dialogue-limit";

describe("DialogueLimit", () => {
  it("allows dialogue when under daily limit", () => {
    const result = DialogueLimit.check(1);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("allows dialogue when at 0 today", () => {
    const result = DialogueLimit.check(0);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks dialogue when at daily limit", () => {
    const result = DialogueLimit.check(2);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.cooldown).toBeDefined();
    expect(result.cooldown!.active).toBe(true);
    expect(result.cooldown!.reason).toBe("DAILY_LIMIT");
  });

  it("blocks dialogue when over daily limit", () => {
    const result = DialogueLimit.check(3);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("MAX_DAILY is 2", () => {
    expect(DialogueLimit.MAX_DAILY).toBe(2);
  });
});
