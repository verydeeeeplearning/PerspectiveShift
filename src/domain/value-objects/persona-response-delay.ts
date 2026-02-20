export class PersonaResponseDelay {
  readonly delayMs: number;

  private constructor(delayMs: number) {
    this.delayMs = Math.round(delayMs);
  }

  static calculate(responseLength: number): PersonaResponseDelay {
    const baseDelay = 3000; // 3 seconds in ms
    const perCharDelay = 50; // 50ms per char
    const jitter = (Math.random() * 3 - 1) * 1000; // -1s to +2s
    const raw = baseDelay + responseLength * perCharDelay + jitter;
    const clamped = Math.max(2000, Math.min(17000, raw)); // 2s~17s range
    return new PersonaResponseDelay(clamped);
  }

  static calculateFromDistribution(
    meanSeconds: number,
    stdDevSeconds: number,
  ): PersonaResponseDelay {
    if (stdDevSeconds < 0) {
      throw new Error("stdDevSeconds must be non-negative");
    }

    const u1 = Math.max(Number.EPSILON, Math.random());
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const sampledSeconds = meanSeconds + z * stdDevSeconds;
    const rawMs = sampledSeconds * 1000;
    const clampedMs = Math.max(2000, Math.min(30000, rawMs));
    return new PersonaResponseDelay(clampedMs);
  }

  get seconds(): number {
    return this.delayMs / 1000;
  }
}
