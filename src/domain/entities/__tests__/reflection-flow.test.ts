import { describe, it, expect } from "vitest";
import { ReflectionFlow } from "../reflection-flow";

describe("ReflectionFlow", () => {
  describe("full mode (create)", () => {
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

    it("is not lightweight mode", () => {
      const flow = ReflectionFlow.create();
      expect(flow.lightweight).toBe(false);
    });

    it("maxQuizQuestions defaults to 3 for full mode", () => {
      const flow = ReflectionFlow.create();
      expect(flow.maxQuizQuestions).toBe(3);
    });

    it("feelHeardThreshold defaults to 2 for full mode", () => {
      const flow = ReflectionFlow.create();
      expect(flow.feelHeardThreshold).toBe(2);
    });
  });

  describe("lightweight mode (createLightweight)", () => {
    it("starts at QUIZ step", () => {
      const flow = ReflectionFlow.createLightweight();
      expect(flow.currentStep).toBe("QUIZ");
    });

    it("is in lightweight mode", () => {
      const flow = ReflectionFlow.createLightweight();
      expect(flow.lightweight).toBe(true);
    });

    it("maxQuizQuestions is 1 for lightweight mode", () => {
      const flow = ReflectionFlow.createLightweight();
      expect(flow.maxQuizQuestions).toBe(1);
    });

    it("feelHeardThreshold defaults to 2 for lightweight mode", () => {
      const flow = ReflectionFlow.createLightweight();
      expect(flow.feelHeardThreshold).toBe(2);
    });

    it("only has QUIZ and VERIFICATION steps (skips STEELMAN and COMMON_GROUND)", () => {
      let flow = ReflectionFlow.createLightweight();
      expect(flow.currentStep).toBe("QUIZ");
      flow = flow.advance();
      expect(flow.currentStep).toBe("VERIFICATION");
      flow = flow.advance();
      expect(flow.isComplete).toBe(true);
    });

    it("isComplete returns true after 2 steps", () => {
      let flow = ReflectionFlow.createLightweight();
      flow = flow.advance().advance();
      expect(flow.isComplete).toBe(true);
    });

    it("isComplete returns false during flow", () => {
      const flow = ReflectionFlow.createLightweight();
      expect(flow.isComplete).toBe(false);
    });

    it("advance from completed lightweight state throws", () => {
      let flow = ReflectionFlow.createLightweight();
      flow = flow.advance().advance();
      expect(() => flow.advance()).toThrow("Cannot advance past completed flow");
    });

    it("progress returns fraction based on 2 total steps", () => {
      const flow = ReflectionFlow.createLightweight();
      expect(flow.progress).toBe(0);
      const step1 = flow.advance();
      expect(step1.progress).toBe(0.5);
      const step2 = step1.advance();
      expect(step2.progress).toBe(1);
    });

    it("lightweight advance preserves lightweight mode", () => {
      const flow = ReflectionFlow.createLightweight();
      const advanced = flow.advance();
      expect(advanced.lightweight).toBe(true);
      expect(advanced.maxQuizQuestions).toBe(1);
      expect(advanced.feelHeardThreshold).toBe(2);
    });
  });

  describe("shouldShowEditUI", () => {
    it("returns true when feelHeardScore is below threshold", () => {
      const flow = ReflectionFlow.create();
      expect(flow.shouldShowEditUI(1)).toBe(true);
    });

    it("returns true when feelHeardScore equals threshold", () => {
      const flow = ReflectionFlow.create();
      expect(flow.shouldShowEditUI(2)).toBe(true);
    });

    it("returns false when feelHeardScore is above threshold", () => {
      const flow = ReflectionFlow.create();
      expect(flow.shouldShowEditUI(3)).toBe(false);
    });

    it("works correctly with lightweight mode default threshold", () => {
      const flow = ReflectionFlow.createLightweight();
      expect(flow.shouldShowEditUI(2)).toBe(true);
      expect(flow.shouldShowEditUI(3)).toBe(false);
    });
  });
});
