import { describe, it, expect } from "vitest";
import { ReceptivenessTemplate } from "../receptiveness-template";

describe("ReceptivenessTemplate", () => {
  it("returns a non-empty list of templates", () => {
    const templates = ReceptivenessTemplate.all();
    expect(templates.length).toBeGreaterThan(0);
  });

  it("each template has id, text, and category", () => {
    const templates = ReceptivenessTemplate.all();
    for (const t of templates) {
      expect(t.id).toBeDefined();
      expect(t.text.length).toBeGreaterThan(0);
      expect(t.category).toBeDefined();
    }
  });

  it("includes CLARIFICATION category templates", () => {
    const templates = ReceptivenessTemplate.all();
    const clarifications = templates.filter((t) => t.category === "CLARIFICATION");
    expect(clarifications.length).toBeGreaterThan(0);
  });

  it("includes ACKNOWLEDGMENT category templates", () => {
    const templates = ReceptivenessTemplate.all();
    const acks = templates.filter((t) => t.category === "ACKNOWLEDGMENT");
    expect(acks.length).toBeGreaterThan(0);
  });

  it("includes ELABORATION category templates", () => {
    const templates = ReceptivenessTemplate.all();
    const elabs = templates.filter((t) => t.category === "ELABORATION");
    expect(elabs.length).toBeGreaterThan(0);
  });

  it("finds template by id", () => {
    const templates = ReceptivenessTemplate.all();
    const first = templates[0];
    const found = ReceptivenessTemplate.findById(first.id);
    expect(found).toBeDefined();
    expect(found!.text).toBe(first.text);
  });

  it("returns null for unknown id", () => {
    const found = ReceptivenessTemplate.findById("unknown-id");
    expect(found).toBeNull();
  });

  it("each template text contains a question mark or blank", () => {
    const templates = ReceptivenessTemplate.all();
    for (const t of templates) {
      const hasQuestionOrBlank = t.text.includes("?") || t.text.includes("____");
      expect(hasQuestionOrBlank).toBe(true);
    }
  });
});
