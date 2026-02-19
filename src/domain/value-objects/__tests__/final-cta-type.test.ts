import { describe, it, expect } from "vitest";
import {
  determineFinalCTA,
  getCTALabel,
  type FinalCTAContext,
  type FinalCTAType,
} from "../final-cta-type";

describe("determineFinalCTA", () => {
  const baseContext: FinalCTAContext = {
    isAgentDialogue: false,
    feelHeardScore: 50,
    hasHumanMatch: false,
    energyLevel: "NORMAL",
  };

  it("returns REST_FOR_TODAY when energyLevel is LOW", () => {
    const ctx: FinalCTAContext = { ...baseContext, energyLevel: "LOW" };
    expect(determineFinalCTA(ctx)).toBe("REST_FOR_TODAY");
  });

  it("returns REST_FOR_TODAY when LOW even if other conditions met", () => {
    const ctx: FinalCTAContext = {
      isAgentDialogue: true,
      hasHumanMatch: true,
      feelHeardScore: 90,
      energyLevel: "LOW",
    };
    expect(determineFinalCTA(ctx)).toBe("REST_FOR_TODAY");
  });

  it("returns TALK_TO_HUMAN when agent dialogue and has human match", () => {
    const ctx: FinalCTAContext = {
      ...baseContext,
      isAgentDialogue: true,
      hasHumanMatch: true,
    };
    expect(determineFinalCTA(ctx)).toBe("TALK_TO_HUMAN");
  });

  it("returns NOTIFY_AND_OTHER_PERSONA when agent dialogue and no human match", () => {
    const ctx: FinalCTAContext = {
      ...baseContext,
      isAgentDialogue: true,
      hasHumanMatch: false,
    };
    expect(determineFinalCTA(ctx)).toBe("NOTIFY_AND_OTHER_PERSONA");
  });

  it("returns BECOME_FRIENDS when feelHeardScore >= 80 and real person", () => {
    const ctx: FinalCTAContext = {
      ...baseContext,
      isAgentDialogue: false,
      feelHeardScore: 80,
    };
    expect(determineFinalCTA(ctx)).toBe("BECOME_FRIENDS");
  });

  it("returns BECOME_FRIENDS when feelHeardScore is 100", () => {
    const ctx: FinalCTAContext = {
      ...baseContext,
      isAgentDialogue: false,
      feelHeardScore: 100,
    };
    expect(determineFinalCTA(ctx)).toBe("BECOME_FRIENDS");
  });

  it("returns FIND_NEXT_DIALOGUE as default", () => {
    const ctx: FinalCTAContext = {
      ...baseContext,
      isAgentDialogue: false,
      feelHeardScore: 50,
    };
    expect(determineFinalCTA(ctx)).toBe("FIND_NEXT_DIALOGUE");
  });

  it("returns FIND_NEXT_DIALOGUE when feelHeardScore is 79 (just below threshold)", () => {
    const ctx: FinalCTAContext = {
      ...baseContext,
      isAgentDialogue: false,
      feelHeardScore: 79,
    };
    expect(determineFinalCTA(ctx)).toBe("FIND_NEXT_DIALOGUE");
  });
});

describe("getCTALabel", () => {
  it("returns Korean label for FIND_NEXT_DIALOGUE", () => {
    expect(getCTALabel("FIND_NEXT_DIALOGUE")).toBe("다음 대화 찾기");
  });

  it("returns Korean label for BECOME_FRIENDS", () => {
    expect(getCTALabel("BECOME_FRIENDS")).toBe("친구 되기");
  });

  it("returns Korean label for TALK_TO_HUMAN", () => {
    expect(getCTALabel("TALK_TO_HUMAN")).toBe("실제 사람과 대화하기");
  });

  it("returns Korean label for NOTIFY_AND_OTHER_PERSONA", () => {
    expect(getCTALabel("NOTIFY_AND_OTHER_PERSONA")).toBe("알림 받기");
  });

  it("returns Korean label for REST_FOR_TODAY", () => {
    expect(getCTALabel("REST_FOR_TODAY")).toBe("오늘은 여기까지");
  });

  it("returns correct label for all CTA types", () => {
    const allTypes: FinalCTAType[] = [
      "FIND_NEXT_DIALOGUE",
      "BECOME_FRIENDS",
      "TALK_TO_HUMAN",
      "NOTIFY_AND_OTHER_PERSONA",
      "REST_FOR_TODAY",
    ];

    for (const cta of allTypes) {
      const label = getCTALabel(cta);
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    }
  });
});
