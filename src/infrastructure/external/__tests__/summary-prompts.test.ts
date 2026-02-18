import { describe, it, expect } from "vitest";
import {
  SUMMARY_SYSTEM_PROMPT,
  summaryUserPrompt,
  UNDERSTANDING_SYSTEM_PROMPT,
  understandingUserPrompt,
} from "../summary-prompts";

describe("Summary Prompts", () => {
  it("SUMMARY_SYSTEM_PROMPT is in Korean", () => {
    expect(SUMMARY_SYSTEM_PROMPT).toContain("요약");
    expect(SUMMARY_SYSTEM_PROMPT).toContain("JSON");
  });

  it("summaryUserPrompt formats turns correctly", () => {
    const turns = [
      { step: "POSITION", participantId: "alice", content: "My position" },
    ];
    const prompt = summaryUserPrompt(turns, "alice", "bob");
    expect(prompt).toContain("참여자A");
    expect(prompt).toContain("My position");
  });

  it("UNDERSTANDING_SYSTEM_PROMPT contains scoring rubric", () => {
    expect(UNDERSTANDING_SYSTEM_PROMPT).toContain("0.0~1.0");
  });

  it("understandingUserPrompt includes reflection and opponent turns", () => {
    const prompt = understandingUserPrompt("my reflection", [
      { step: "POSITION", content: "opponent content" },
    ]);
    expect(prompt).toContain("my reflection");
    expect(prompt).toContain("opponent content");
  });
});
