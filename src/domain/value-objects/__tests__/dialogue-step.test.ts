import { describe, it, expect } from "vitest";
import {
  DIALOGUE_STEPS,
  stepOrder,
  nextStep,
  isValidStep,
  isFinalStep,
} from "../dialogue-step";

describe("DialogueStep", () => {
  it("has 4 steps in correct order", () => {
    expect(DIALOGUE_STEPS).toEqual([
      "POSITION",
      "QUESTION",
      "ANSWER",
      "REFLECTION",
    ]);
  });

  it("stepOrder returns correct indices", () => {
    expect(stepOrder("POSITION")).toBe(0);
    expect(stepOrder("QUESTION")).toBe(1);
    expect(stepOrder("ANSWER")).toBe(2);
    expect(stepOrder("REFLECTION")).toBe(3);
  });

  it("nextStep returns next step", () => {
    expect(nextStep("POSITION")).toBe("QUESTION");
    expect(nextStep("QUESTION")).toBe("ANSWER");
    expect(nextStep("ANSWER")).toBe("REFLECTION");
  });

  it("nextStep returns null for final step", () => {
    expect(nextStep("REFLECTION")).toBeNull();
  });

  it("isValidStep validates correctly", () => {
    expect(isValidStep("POSITION")).toBe(true);
    expect(isValidStep("INVALID")).toBe(false);
  });

  it("isFinalStep identifies REFLECTION", () => {
    expect(isFinalStep("REFLECTION")).toBe(true);
    expect(isFinalStep("POSITION")).toBe(false);
  });
});
