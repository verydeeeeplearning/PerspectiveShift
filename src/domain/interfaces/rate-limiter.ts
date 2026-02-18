export interface RateLimiter {
  isAllowed(key: string): boolean;
  consume(key: string): void;
}
