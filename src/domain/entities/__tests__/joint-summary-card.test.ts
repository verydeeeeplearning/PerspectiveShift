import { describe, it, expect } from "vitest";
import { JointSummaryCard } from "../joint-summary-card";

describe("JointSummaryCard", () => {
  it("creates card with agreed and disagreed points", () => {
    const card = JointSummaryCard.create({
      agreedPoints: ["기술 발전은 필요하다"],
      disagreedPoints: ["규제의 범위"],
      sharedQuestion: "AI 교육에 대해",
      dialogueId: "d-1",
    });
    expect(card.agreedPoints).toHaveLength(1);
    expect(card.disagreedPoints).toHaveLength(1);
    expect(card.sharedQuestion).toContain("교육");
  });

  it("allows null sharedQuestion", () => {
    const card = JointSummaryCard.create({
      agreedPoints: ["A"], disagreedPoints: ["B"], sharedQuestion: null, dialogueId: "d-1",
    });
    expect(card.sharedQuestion).toBeNull();
  });

  it("requires at least one agreed or disagreed point", () => {
    expect(() => JointSummaryCard.create({
      agreedPoints: [], disagreedPoints: [], sharedQuestion: null, dialogueId: "d-1",
    })).toThrow();
  });

  it("stores dialogueId", () => {
    const card = JointSummaryCard.create({
      agreedPoints: ["A"], disagreedPoints: [], sharedQuestion: null, dialogueId: "d-99",
    });
    expect(card.dialogueId).toBe("d-99");
  });

  // --- v4 P0-D2: Enhanced JointSummaryCard fields ---

  describe("v4 enhanced fields", () => {
    it("creates card with all enhanced fields", () => {
      const card = JointSummaryCard.create({
        agreedPoints: ["환경 보호 중요"],
        disagreedPoints: ["원전 방식"],
        sharedQuestion: "에너지 믹스?",
        dialogueId: "d-10",
        topic: "에너지 정책",
        date: "2026-02-19",
        myKeyPoint: "신재생 에너지 확대",
        opponentKeyPoint: "원전이 현실적",
        commonGround: "탄소 감축 필요",
        newDiscovery: "원전 안전성 개선됨",
        understandingScore: 0.8,
        feelHeardScore: 4,
        autoSaved: true,
      });
      expect(card.topic).toBe("에너지 정책");
      expect(card.date).toBe("2026-02-19");
      expect(card.myKeyPoint).toBe("신재생 에너지 확대");
      expect(card.opponentKeyPoint).toBe("원전이 현실적");
      expect(card.commonGround).toBe("탄소 감축 필요");
      expect(card.newDiscovery).toBe("원전 안전성 개선됨");
      expect(card.understandingScore).toBe(0.8);
      expect(card.feelHeardScore).toBe(4);
      expect(card.autoSaved).toBe(true);
    });

    it("provides defaults for all new fields when omitted (backwards compatibility)", () => {
      const card = JointSummaryCard.create({
        agreedPoints: ["A"],
        disagreedPoints: [],
        sharedQuestion: null,
        dialogueId: "d-1",
      });
      expect(card.topic).toBe("");
      expect(card.date).toBe("");
      expect(card.myKeyPoint).toBe("");
      expect(card.opponentKeyPoint).toBe("");
      expect(card.commonGround).toBeNull();
      expect(card.newDiscovery).toBeNull();
      expect(card.understandingScore).toBe(0);
      expect(card.feelHeardScore).toBe(0);
      expect(card.autoSaved).toBe(true);
    });

    it("validates understandingScore is between 0 and 1", () => {
      expect(() =>
        JointSummaryCard.create({
          agreedPoints: ["A"],
          disagreedPoints: [],
          sharedQuestion: null,
          dialogueId: "d-1",
          understandingScore: 1.5,
        }),
      ).toThrow("Understanding score must be between 0 and 1");
    });

    it("validates understandingScore is not negative", () => {
      expect(() =>
        JointSummaryCard.create({
          agreedPoints: ["A"],
          disagreedPoints: [],
          sharedQuestion: null,
          dialogueId: "d-1",
          understandingScore: -0.1,
        }),
      ).toThrow("Understanding score must be between 0 and 1");
    });

    it("validates feelHeardScore is between 1 and 5", () => {
      expect(() =>
        JointSummaryCard.create({
          agreedPoints: ["A"],
          disagreedPoints: [],
          sharedQuestion: null,
          dialogueId: "d-1",
          feelHeardScore: 6,
        }),
      ).toThrow("Feel heard score must be between 1 and 5");
    });

    it("validates feelHeardScore is not negative", () => {
      expect(() =>
        JointSummaryCard.create({
          agreedPoints: ["A"],
          disagreedPoints: [],
          sharedQuestion: null,
          dialogueId: "d-1",
          feelHeardScore: -1,
        }),
      ).toThrow("Feel heard score must be between 1 and 5");
    });

    it("allows feelHeardScore of 0 when defaulted (not explicitly set)", () => {
      const card = JointSummaryCard.create({
        agreedPoints: ["A"],
        disagreedPoints: [],
        sharedQuestion: null,
        dialogueId: "d-1",
      });
      // Default 0 means "not yet rated"
      expect(card.feelHeardScore).toBe(0);
    });

    it("allows boundary values for understandingScore", () => {
      const card0 = JointSummaryCard.create({
        agreedPoints: ["A"],
        disagreedPoints: [],
        sharedQuestion: null,
        dialogueId: "d-1",
        understandingScore: 0,
      });
      expect(card0.understandingScore).toBe(0);

      const card1 = JointSummaryCard.create({
        agreedPoints: ["A"],
        disagreedPoints: [],
        sharedQuestion: null,
        dialogueId: "d-2",
        understandingScore: 1,
      });
      expect(card1.understandingScore).toBe(1);
    });

    it("allows boundary values for feelHeardScore", () => {
      const card1 = JointSummaryCard.create({
        agreedPoints: ["A"],
        disagreedPoints: [],
        sharedQuestion: null,
        dialogueId: "d-1",
        feelHeardScore: 1,
      });
      expect(card1.feelHeardScore).toBe(1);

      const card5 = JointSummaryCard.create({
        agreedPoints: ["A"],
        disagreedPoints: [],
        sharedQuestion: null,
        dialogueId: "d-2",
        feelHeardScore: 5,
      });
      expect(card5.feelHeardScore).toBe(5);
    });

    it("allows null commonGround and newDiscovery", () => {
      const card = JointSummaryCard.create({
        agreedPoints: ["A"],
        disagreedPoints: [],
        sharedQuestion: null,
        dialogueId: "d-1",
        commonGround: null,
        newDiscovery: null,
      });
      expect(card.commonGround).toBeNull();
      expect(card.newDiscovery).toBeNull();
    });
  });
});
