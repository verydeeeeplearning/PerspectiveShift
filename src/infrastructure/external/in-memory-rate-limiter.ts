import type { RateLimiter } from "@/domain/interfaces/rate-limiter";

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

export class InMemoryRateLimiter implements RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  private readonly maxTokens: number;
  private readonly refillIntervalMs: number;

  constructor(maxTokens: number = 10, refillIntervalMs: number = 60_000) {
    this.maxTokens = maxTokens;
    this.refillIntervalMs = refillIntervalMs;
  }

  isAllowed(key: string): boolean {
    this.refill(key);
    const bucket = this.buckets.get(key);
    if (!bucket) return true;
    return bucket.tokens > 0;
  }

  consume(key: string): void {
    this.refill(key);
    const bucket = this.buckets.get(key);
    if (!bucket) {
      this.buckets.set(key, {
        tokens: this.maxTokens - 1,
        lastRefill: Date.now(),
      });
      return;
    }
    bucket.tokens = Math.max(0, bucket.tokens - 1);
  }

  private refill(key: string): void {
    const bucket = this.buckets.get(key);
    if (!bucket) return;

    const now = Date.now();
    const elapsed = now - bucket.lastRefill;

    if (elapsed >= this.refillIntervalMs) {
      const refills = Math.floor(elapsed / this.refillIntervalMs);
      bucket.tokens = Math.min(
        this.maxTokens,
        bucket.tokens + refills * this.maxTokens,
      );
      bucket.lastRefill = bucket.lastRefill + refills * this.refillIntervalMs;
    }
  }
}
