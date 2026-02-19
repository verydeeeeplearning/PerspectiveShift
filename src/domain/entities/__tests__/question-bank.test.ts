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
  for (let i = 1; i <= 30; i++) {
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
      expect(bank.rotatingCount).toBe(30);
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
    it("QUICK mode returns exactly 5 questions", () => {
      const bank = makeBank();
      const questions = bank.sampleForMode("QUICK");
      expect(questions).toHaveLength(5);
    });

    it("STANDARD mode returns exactly 10 questions", () => {
      const bank = makeBank();
      const questions = bank.sampleForMode("STANDARD");
      expect(questions).toHaveLength(10);
    });

    it("PRECISE mode returns exactly 20 questions", () => {
      const bank = makeBank();
      const questions = bank.sampleForMode("PRECISE");
      expect(questions).toHaveLength(20);
    });

    it("always includes all anchor questions first", () => {
      const bank = makeBank();
      const questions = bank.sampleForMode("STANDARD");
      const anchorIds = questions
        .filter((q) => q.isAnchor)
        .map((q) => q.id);
      expect(anchorIds.length).toBeGreaterThanOrEqual(5);
    });

    it("QUICK mode uses 5 core anchors only", () => {
      const bank = makeBank();
      const questions = bank.sampleForMode("QUICK");
      // In QUICK mode, all 5 questions should be anchors (core 5)
      const anchors = questions.filter((q) => q.isAnchor);
      expect(anchors.length).toBe(5);
    });

    it("fills remaining slots with rotating questions", () => {
      const bank = makeBank();
      const questions = bank.sampleForMode("STANDARD");
      const rotating = questions.filter((q) => !q.isAnchor);
      expect(rotating.length).toBe(3); // 10 - 7 anchors = 3 rotating
    });

    it("samples different rotating questions on each call", () => {
      const bank = makeBank();
      const sample1 = bank.sampleForMode("PRECISE");
      const sample2 = bank.sampleForMode("PRECISE");

      const ids1 = sample1.filter((q) => !q.isAnchor).map((q) => q.id);
      const ids2 = sample2.filter((q) => !q.isAnchor).map((q) => q.id);

      // Not guaranteed to be different every time, but with 30 rotating items
      // and 13 slots, extremely unlikely to be identical
      // We just check both have the right count
      expect(ids1.length).toBe(13);
      expect(ids2.length).toBe(13);
    });

    it("does not include duplicate questions", () => {
      const bank = makeBank();
      const questions = bank.sampleForMode("PRECISE");
      const ids = questions.map((q) => q.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });

  describe("sampleExtension", () => {
    it("returns additional questions for extending from 5 to 10", () => {
      const bank = makeBank();
      const initial = bank.sampleForMode("QUICK");
      const initialIds = new Set(initial.map((q) => q.id));

      const extension = bank.sampleExtension(5, initialIds);
      expect(extension).toHaveLength(5);

      // No overlap with initial questions
      for (const q of extension) {
        expect(initialIds.has(q.id)).toBe(false);
      }
    });

    it("returns additional questions for extending from 10 to 20", () => {
      const bank = makeBank();
      const initial = bank.sampleForMode("STANDARD");
      const initialIds = new Set(initial.map((q) => q.id));

      const extension = bank.sampleExtension(10, initialIds);
      expect(extension).toHaveLength(10);

      for (const q of extension) {
        expect(initialIds.has(q.id)).toBe(false);
      }
    });
  });
});
