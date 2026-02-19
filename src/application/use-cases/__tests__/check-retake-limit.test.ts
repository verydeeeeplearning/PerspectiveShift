import { describe, it, expect } from "vitest";
import { CheckRetakeLimitUseCase } from "../check-retake-limit";

describe("CheckRetakeLimitUseCase", () => {
  const uc = new CheckRetakeLimitUseCase();

  it("allows first retake", () => {
    const result = uc.execute(0, null);

    expect(result.allowed).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it("blocks same-day retake", () => {
    const now = new Date();
    const result = uc.execute(1, now);

    expect(result.allowed).toBe(false);
    expect(result.message).toContain("내일");
  });

  it("allows retake on next day", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = uc.execute(1, yesterday);

    expect(result.allowed).toBe(true);
  });

  it("warns on excessive retakes", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = uc.execute(3, yesterday);

    expect(result.allowed).toBe(true);
    expect(result.warning).toBeDefined();
  });
});
