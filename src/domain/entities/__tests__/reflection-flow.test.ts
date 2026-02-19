import { describe, it, expect } from "vitest";
import { ReflectionFlow, type ReflectionStep } from "../reflection-flow";

describe("ReflectionFlow", () => {
  it("starts at QUIZ step", () => {
    const flow = ReflectionFlow.create();
    expect(flow.currentStep).toBe("QUIZ");
  });

  it("follows R1→R2→R3→R4 sequence", () => {
    let flow = ReflectionFlow.create();
    expect(flow.currentStep).toBe("QUIZ");
    flow = flow.advance();
    expect(flow.currentStep).toBe("VERIFICATION");
    flow = flow.advance();
    expect(flow.currentStep).toBe("STEELMAN");
    flow = flow.advance();
    expect(flow.currentStep).toBe("COMMON_GROUND");
  });

  it("isComplete returns true after last step", () => {
    let flow = ReflectionFlow.create();
    flow = flow.advance().advance().advance().advance();
    expect(flow.isComplete).toBe(true);
  });

  it("isComplete returns false during flow", () => {
    const flow = ReflectionFlow.create();
    expect(flow.isComplete).toBe(false);
  });

  it("advance from completed state throws", () => {
    let flow = ReflectionFlow.create();
    flow = flow.advance().advance().advance().advance();
    expect(() => flow.advance()).toThrow();
  });

  it("progress returns fraction (0-1)", () => {
    const flow = ReflectionFlow.create();
    expect(flow.progress).toBe(0);
    const advanced = flow.advance();
    expect(advanced.progress).toBe(0.25);
  });

  it("stepIndex returns correct number", () => {
    const flow = ReflectionFlow.create();
    expect(flow.stepIndex).toBe(0);
    expect(flow.advance().stepIndex).toBe(1);
  });

  it("totalSteps is 4", () => {
    expect(ReflectionFlow.TOTAL_STEPS).toBe(4);
  });

  it("isStepRequired determines if current step can be skipped", () => {
    const flow = ReflectionFlow.create();
    // QUIZ is required
    expect(flow.isStepRequired).toBe(true);
    // VERIFICATION is required
    expect(flow.advance().isStepRequired).toBe(true);
    // STEELMAN can be optional (depends on policy, default false)
    expect(flow.advance().advance().isStepRequired).toBe(false);
    // COMMON_GROUND is optional
    expect(flow.advance().advance().advance().isStepRequired).toBe(false);
  });
});
