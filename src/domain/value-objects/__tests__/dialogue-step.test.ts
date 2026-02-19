import { describe, it, expect } from "vitest";
import {
  DIALOGUE_STEPS,
  stepOrder,
  nextStep,
  isValidStep,
  isFinalStep,
  getStepsForEffort,
} from "../dialogue-step";

describe("DialogueStep", () => {
  it("has 6 steps in correct order", () => {
    expect(DIALOGUE_STEPS).toEqual([
      "AFFIRMATION",
      "POSITION",
      "QUESTION",
      "ANSWER",
      "REFLECTION",
      "JOINT_SUMMARY",
    ]);
  });

  it("stepOrder returns correct indices", () => {
    expect(stepOrder("AFFIRMATION")).toBe(0);
    expect(stepOrder("POSITION")).toBe(1);
    expect(stepOrder("QUESTION")).toBe(2);
    expect(stepOrder("ANSWER")).toBe(3);
    expect(stepOrder("REFLECTION")).toBe(4);
    expect(stepOrder("JOINT_SUMMARY")).toBe(5);
  });

  it("nextStep returns next step", () => {
    expect(nextStep("AFFIRMATION")).toBe("POSITION");
    expect(nextStep("POSITION")).toBe("QUESTION");
    expect(nextStep("QUESTION")).toBe("ANSWER");
    expect(nextStep("ANSWER")).toBe("REFLECTION");
    expect(nextStep("REFLECTION")).toBe("JOINT_SUMMARY");
  });

  it("nextStep returns null for final step", () => {
    expect(nextStep("JOINT_SUMMARY")).toBeNull();
  });

  it("isValidStep validates correctly", () => {
    expect(isValidStep("POSITION")).toBe(true);
    expect(isValidStep("AFFIRMATION")).toBe(true);
    expect(isValidStep("JOINT_SUMMARY")).toBe(true);
    expect(isValidStep("INVALID")).toBe(false);
  });

  it("isFinalStep identifies JOINT_SUMMARY", () => {
    expect(isFinalStep("JOINT_SUMMARY")).toBe(true);
    expect(isFinalStep("REFLECTION")).toBe(false);
    expect(isFinalStep("POSITION")).toBe(false);
  });

  it("getStepsForEffort returns correct steps", () => {
    expect(getStepsForEffort("QUICK")).toEqual(["POSITION", "REFLECTION"]);
    expect(getStepsForEffort("STRUCTURED")).toHaveLength(6);
    expect(getStepsForEffort("DEEP")).toHaveLength(6);
  });
});
