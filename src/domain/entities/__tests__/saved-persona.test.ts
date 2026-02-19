import { describe, it, expect } from "vitest";
import { SavedPersona } from "../saved-persona";

describe("SavedPersona", () => {
  it("initializes empty memory", () => {
    const saved = SavedPersona.initialize("u-1", "p-1");
    expect(saved.conversationCount).toBe(0);
    expect(saved.conversationSummaries).toHaveLength(0);
  });

  it("appends conversation and merges memory", () => {
    const saved = SavedPersona.initialize("u-1", "p-1");
    const next = saved.appendConversation({
      summary: "요약 1",
      sharedContext: ["교육"],
      userStanceMemory: ["형평성 중요"],
      savedQuestions: ["재원은?"],
    });

    expect(next.conversationCount).toBe(1);
    expect(next.conversationSummaries).toContain("요약 1");
    expect(next.sharedContext).toContain("교육");
  });
});
