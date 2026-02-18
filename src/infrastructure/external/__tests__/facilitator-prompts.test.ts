import { describe, it, expect } from "vitest";
import {
  TONE_CHECK_SYSTEM_PROMPT,
  toneCheckUserPrompt,
  DRIFT_CHECK_SYSTEM_PROMPT,
  driftCheckUserPrompt,
} from "../facilitator-prompts";

describe("Facilitator Prompts", () => {
  it("TONE_CHECK_SYSTEM_PROMPT is in Korean", () => {
    expect(TONE_CHECK_SYSTEM_PROMPT).toContain("톤");
    expect(TONE_CHECK_SYSTEM_PROMPT).toContain("JSON");
  });

  it("toneCheckUserPrompt includes content", () => {
    const prompt = toneCheckUserPrompt("test content");
    expect(prompt).toContain("test content");
  });

  it("DRIFT_CHECK_SYSTEM_PROMPT is in Korean", () => {
    expect(DRIFT_CHECK_SYSTEM_PROMPT).toContain("논점");
    expect(DRIFT_CHECK_SYSTEM_PROMPT).toContain("JSON");
  });

  it("driftCheckUserPrompt includes both contents", () => {
    const prompt = driftCheckUserPrompt("current", "original");
    expect(prompt).toContain("current");
    expect(prompt).toContain("original");
  });
});
