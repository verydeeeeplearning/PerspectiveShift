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

  get seconds(): number {
    return this.delayMs / 1000;
  }
}
