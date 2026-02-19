import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { InMemoryRateLimiter } from "../in-memory-rate-limiter";

describe("InMemoryRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests when bucket is not exhausted", () => {
    const limiter = new InMemoryRateLimiter(10, 60_000);
    expect(limiter.isAllowed("user-1")).toBe(true);
  });

  it("denies requests when tokens are exhausted", () => {
    const limiter = new InMemoryRateLimiter(3, 60_000);
    for (let i = 0; i < 3; i++) {
      limiter.consume("user-1");
    }
    expect(limiter.isAllowed("user-1")).toBe(false);
  });

  it("tracks different users independently", () => {
    const limiter = new InMemoryRateLimiter(2, 60_000);
    limiter.consume("user-1");
    limiter.consume("user-1");
    expect(limiter.isAllowed("user-1")).toBe(false);
    expect(limiter.isAllowed("user-2")).toBe(true);
  });

  it("refills tokens after the interval", () => {
    const limiter = new InMemoryRateLimiter(2, 60_000);
    limiter.consume("user-1");
    limiter.consume("user-1");
    expect(limiter.isAllowed("user-1")).toBe(false);

    vi.advanceTimersByTime(60_000);
    expect(limiter.isAllowed("user-1")).toBe(true);
  });

  it("uses default values of 10 tokens per 60 seconds", () => {
    const limiter = new InMemoryRateLimiter();
    for (let i = 0; i < 10; i++) {
      limiter.consume("user-1");
    }
    expect(limiter.isAllowed("user-1")).toBe(false);

    vi.advanceTimersByTime(60_000);
    expect(limiter.isAllowed("user-1")).toBe(true);
  });
});
