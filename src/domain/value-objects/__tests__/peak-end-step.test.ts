import { describe, it, expect } from "vitest";
import { PeakEndStep, PEAK_END_STEPS } from "../peak-end-step";

describe("PeakEndStep", () => {
  it("has 6 steps in correct order", () => {
    expect(PEAK_END_STEPS).toEqual([
      "JOINT_SUMMARY",
      "GIFT_MESSAGE",
      "BLIND_SPOT",
      "KPI_COLLECTION",
      "NEXT_QUESTION",
      "FINAL_CTA",
    ]);
  });

  it("first() starts at JOINT_SUMMARY with index 0", () => {
    const step = PeakEndStep.first();
    expect(step.current).toBe("JOINT_SUMMARY");
    expect(step.index).toBe(0);
  });

  it("advance() moves through steps in order", () => {
    let step = PeakEndStep.first();
    expect(step.current).toBe("JOINT_SUMMARY");

    step = step.advance();
    expect(step.current).toBe("GIFT_MESSAGE");
    expect(step.index).toBe(1);

    step = step.advance();
    expect(step.current).toBe("BLIND_SPOT");
    expect(step.index).toBe(2);

    step = step.advance();
    expect(step.current).toBe("KPI_COLLECTION");
    expect(step.index).toBe(3);

    step = step.advance();
    expect(step.current).toBe("NEXT_QUESTION");
    expect(step.index).toBe(4);

    step = step.advance();
    expect(step.current).toBe("FINAL_CTA");
    expect(step.index).toBe(5);
  });

  it("isComplete is false during flow", () => {
    let step = PeakEndStep.first();
    for (let i = 0; i < PEAK_END_STEPS.length; i++) {
      expect(step.isComplete).toBe(false);
      if (i < PEAK_END_STEPS.length - 1) {
        step = step.advance();
      }
    }
  });

  it("isComplete is true after all 6 steps are advanced past", () => {
    let step = PeakEndStep.first();
    // Advance through all 6 steps (index 0..5) then one more to index 6
    for (let i = 0; i < PEAK_END_STEPS.length; i++) {
      step = step.advance();
    }
    expect(step.isComplete).toBe(true);
  });

  it("progress calculation returns correct ratios", () => {
    const step = PeakEndStep.first();
    expect(step.progress).toBe(0 / PEAK_END_STEPS.length);

    const step2 = step.advance();
    expect(step2.progress).toBe(1 / PEAK_END_STEPS.length);

    const step3 = step2.advance();
    expect(step3.progress).toBe(2 / PEAK_END_STEPS.length);
  });

  it("advance past complete throws error", () => {
    let step = PeakEndStep.first();
    for (let i = 0; i < PEAK_END_STEPS.length; i++) {
      step = step.advance();
    }
    expect(step.isComplete).toBe(true);
    expect(() => step.advance()).toThrow("Cannot advance past completed flow");
  });

  it("is immutable - advance returns new instance", () => {
    const step1 = PeakEndStep.first();
    const step2 = step1.advance();
    expect(step1.index).toBe(0);
    expect(step2.index).toBe(1);
    expect(step1).not.toBe(step2);
  });
});
