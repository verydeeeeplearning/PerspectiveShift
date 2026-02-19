import { describe, it, expect } from "vitest";
import { InterventionPolicy } from "../intervention-policy";
import type { JitaiSignal } from "../jitai-signal";

function makeSignal(overrides: Partial<JitaiSignal> = {}): JitaiSignal {
  return {
    energy: 60,
    idleSeconds: 0,
    deleteCount: 0,
    consecutiveToneChecks: 0,
    feelHeardScore: 4,
    highlightCount: 1,
    quoteCount: 1,
    hasReport: false,
    turnCount: 1,
    currentStep: "POSITION",
    ...overrides,
  };
}

describe("InterventionPolicy", () => {
  it("prioritizes distress rule", () => {
    const result = InterventionPolicy.evaluate(
      makeSignal({
        hasReport: true,
        energy: 10,
      }),
    );

    expect(result.type).toBe("break_suggest");
    expect(result.reason).toBe("distress_signal");
  });

  it("returns tone check when tension signal is repeated", () => {
    const result = InterventionPolicy.evaluate(
      makeSignal({
        consecutiveToneChecks: 2,
      }),
    );

    expect(result.type).toBe("tone_check");
    expect(result.reason).toBe("repeated_tone_tension");
  });

  it("returns coach for blank fear signal", () => {
    const result = InterventionPolicy.evaluate(
      makeSignal({
        idleSeconds: 100,
        deleteCount: 2,
      }),
    );

    expect(result.type).toBe("coach");
    expect(result.reason).toBe("idle_with_rewrites");
  });

  it("returns coach for low listening signal", () => {
    const result = InterventionPolicy.evaluate(
      makeSignal({
        turnCount: 3,
        highlightCount: 0,
        quoteCount: 0,
      }),
    );

    expect(result.type).toBe("coach");
    expect(result.reason).toBe("low_listening_signal");
  });

  it("returns none for normal progress", () => {
    const result = InterventionPolicy.evaluate(makeSignal());

    expect(result.type).toBe("none");
    expect(result.reason).toBe("normal_progress");
  });
});
