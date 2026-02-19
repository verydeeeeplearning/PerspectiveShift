import { describe, it, expect } from "vitest";
import {
  ScaffoldTemplate,
  type DialogueStep,
} from "../scaffold-template";

describe("ScaffoldTemplate", () => {
  it("returns POSITION scaffold with blank slots", () => {
    const scaffold = ScaffoldTemplate.forStep("POSITION");
    expect(scaffold.step).toBe("POSITION");
    expect(scaffold.placeholder).toContain("____");
    expect(scaffold.placeholder).toContain("생각");
  });

  it("returns QUESTION scaffold with quote reference", () => {
    const scaffold = ScaffoldTemplate.forStep("QUESTION");
    expect(scaffold.step).toBe("QUESTION");
    expect(scaffold.placeholder).toContain("____");
  });

  it("returns ANSWER scaffold", () => {
    const scaffold = ScaffoldTemplate.forStep("ANSWER");
    expect(scaffold.step).toBe("ANSWER");
    expect(scaffold.placeholder.length).toBeGreaterThan(0);
  });

  it("returns empty placeholder for AFFIRMATION step", () => {
    const scaffold = ScaffoldTemplate.forStep("AFFIRMATION");
    expect(scaffold.placeholder).toBe("");
  });

  it("returns empty placeholder for REFLECTION step", () => {
    const scaffold = ScaffoldTemplate.forStep("REFLECTION");
    expect(scaffold.placeholder).toBe("");
  });

  it("returns empty placeholder for JOINT_SUMMARY step", () => {
    const scaffold = ScaffoldTemplate.forStep("JOINT_SUMMARY");
    expect(scaffold.placeholder).toBe("");
  });

  it("exposes step and placeholder as readonly", () => {
    const scaffold = ScaffoldTemplate.forStep("POSITION");
    expect(scaffold.step).toBeDefined();
    expect(scaffold.placeholder).toBeDefined();
  });
});
