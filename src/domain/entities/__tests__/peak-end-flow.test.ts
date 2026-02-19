import { describe, it, expect } from "vitest";
import { PeakEndFlow } from "../peak-end-flow";

describe("PeakEndFlow", () => {
  it("starts at JOINT_SUMMARY step", () => {
    const flow = PeakEndFlow.create();
    expect(flow.currentStep).toBe("JOINT_SUMMARY");
  });

  it("follows 5-step sequence", () => {
    let flow = PeakEndFlow.create();
    expect(flow.currentStep).toBe("JOINT_SUMMARY");
    flow = flow.advance();
    expect(flow.currentStep).toBe("GIFT");
    flow = flow.advance();
    expect(flow.currentStep).toBe("BLIND_SPOT");
    flow = flow.advance();
    expect(flow.currentStep).toBe("KPI");
    flow = flow.advance();
    expect(flow.currentStep).toBe("NEXT_QUESTION");
  });

  it("isComplete after all steps", () => {
    let flow = PeakEndFlow.create();
    for (let i = 0; i < 5; i++) flow = flow.advance();
    expect(flow.isComplete).toBe(true);
  });

  it("throws when advancing past complete", () => {
    let flow = PeakEndFlow.create();
    for (let i = 0; i < 5; i++) flow = flow.advance();
    expect(() => flow.advance()).toThrow();
  });

  it("totalSteps is 5", () => {
    expect(PeakEndFlow.TOTAL_STEPS).toBe(5);
  });

  it("progress returns fraction", () => {
    const flow = PeakEndFlow.create();
    expect(flow.progress).toBe(0);
    expect(flow.advance().progress).toBe(0.2);
  });
});
