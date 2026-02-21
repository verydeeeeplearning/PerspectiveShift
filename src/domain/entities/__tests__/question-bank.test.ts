import { describe, it, expect } from "vitest";
import { QuestionBank } from "../question-bank";
import { QuestionItem } from "../../value-objects/question-item";

function makeAnchorQuestion(id: string, axis: string) {
  return QuestionItem.create({
    id,
    text: `Anchor question ${id}`,
    type: "OX",
    axis: axis as import("../../value-objects/stance-dimension").StanceDimension,
    isAnchor: true,
  });
}

function makeRotatingQuestion(id: string, axis: string, variant = "A") {
  return QuestionItem.create({
    id,
    text: `Rotating question ${id}`,
    type: "OX",
    axis: axis as import("../../value-objects/stance-dimension").StanceDimension,
    isAnchor: false,
    variant,
  });
}

function makeBank(): QuestionBank {
  const anchors = [
    makeAnchorQuestion("a1", "TECH_REGULATION"),
    makeAnchorQuestion("a2", "REDISTRIBUTION"),
    makeAnchorQuestion("a3", "WORK_LIFE"),
    makeAnchorQuestion("a4", "MERITOCRACY"),
    makeAnchorQuestion("a5", "TECH_OPTIMISM"),
    makeAnchorQuestion("a6", "OPPORTUNITY_EQUALITY"),
    makeAnchorQuestion("a7", "TECH_REGULATION"),
  ];

  const rotating: QuestionItem[] = [];
  for (let i = 1; i <= 50; i++) {
    const axes = [
      "TECH_REGULATION",
      "REDISTRIBUTION",
      "WORK_LIFE",
      "MERITOCRACY",
      "TECH_OPTIMISM",
      "OPPORTUNITY_EQUALITY",
    ];
    rotating.push(
      makeRotatingQuestion(`r${i}`, axes[i % axes.length], `V${i % 3}`),
    );
  }

  return QuestionBank.create([...anchors, ...rotating]);
}

describe("QuestionBank", () => {
  describe("create", () => {
    it("separates anchor and rotating questions", () => {
      const bank = makeBank();
      expect(bank.anchorCount).toBe(7);
      expect(bank.rotatingCount).toBe(50);
    });

    it("throws if fewer than 5 anchor questions", () => {
      const questions = [
        makeAnchorQuestion("a1", "TECH_REGULATION"),
        makeAnchorQuestion("a2", "REDISTRIBUTION"),
      ];
      expect(() => QuestionBank.create(questions)).toThrow(
        "At least 5 anchor questions required",
      );
    });
  });

  describe("sampleForMode", () => {
    it("LITE mode returns exactly 10 questions", () => {
      const bank = makeBank();
      const questions = bank.sampleForMode("LITE");
      expect(questions).toHaveLength(10);
    });

    it("STANDARD mode returns exactly 20 questions", () => {
      const bank = makeBank();
      const questions = bank.sampleForMode("STANDARD");
      expect(questions).toHaveLength(20);
    });

    it("DEEP mode returns exactly 30 questions", () => {
      const bank = makeBank();
      const questions = bank.sampleForMode("DEEP");
      expect(questions).toHaveLength(30);
    });

    it("COMPREHENSIVE mode returns exactly 50 questions", () => {
      const bank = makeBank();
      const questions = bank.sampleForMode("COMPREHENSIVE");
      expect(questions).toHaveLength(50);
    });

    it("always includes all anchor questions first", () => {
      const bank = makeBank();
      const questions = bank.sampleForMode("LITE");
      const anchorIds = questions
        .filter((q) => q.isAnchor)
        .map((q) => q.id);
      expect(anchorIds.length).toBeGreaterThanOrEqual(5);
    });

    it("fills remaining slots with rotating questions", () => {
      const bank = makeBank();
      const questions = bank.sampleForMode("LITE");
      const rotating = questions.filter((q) => !q.isAnchor);
      expect(rotating.length).toBe(3); // 10 - 7 anchors = 3 rotating
    });

    it("does not include duplicate questions", () => {
      const bank = makeBank();
      const questions = bank.sampleForMode("DEEP");
      const ids = questions.map((q) => q.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });

  describe("sampleExtension", () => {
    it("returns additional questions excluding existing ones", () => {
      const bank = makeBank();
      const initial = bank.sampleForMode("LITE");
      const initialIds = new Set(initial.map((q) => q.id));

      const extension = bank.sampleExtension(10, initialIds);
      expect(extension).toHaveLength(10);

      // No overlap with initial questions
      for (const q of extension) {
        expect(initialIds.has(q.id)).toBe(false);
      }
    });
  });

  describe("getSeedQuestions", () => {
    it("returns the first N questions (anchors first)", () => {
      const bank = makeBank();
      const seeds = bank.getSeedQuestions(10);
      expect(seeds).toHaveLength(10);
      // First 7 should be anchors
      expect(seeds.slice(0, 7).every((q) => q.isAnchor)).toBe(true);
    });
  });
});
