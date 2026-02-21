import { describe, it, expect } from "vitest";
import {
  QUESTION_GENERATION_SYSTEM_PROMPT,
  buildQuestionGenerationUserPrompt,
} from "../question-generation-prompts";

describe("question-generation-prompts", () => {
  describe("QUESTION_GENERATION_SYSTEM_PROMPT", () => {
    it("contains all 6 dimension definitions", () => {
      expect(QUESTION_GENERATION_SYSTEM_PROMPT).toContain("TECH_REGULATION");
      expect(QUESTION_GENERATION_SYSTEM_PROMPT).toContain("REDISTRIBUTION");
      expect(QUESTION_GENERATION_SYSTEM_PROMPT).toContain("WORK_LIFE");
      expect(QUESTION_GENERATION_SYSTEM_PROMPT).toContain("MERITOCRACY");
      expect(QUESTION_GENERATION_SYSTEM_PROMPT).toContain("TECH_OPTIMISM");
      expect(QUESTION_GENERATION_SYSTEM_PROMPT).toContain("OPPORTUNITY_EQUALITY");
    });

    it("specifies OX and RUBRIC question types", () => {
      expect(QUESTION_GENERATION_SYSTEM_PROMPT).toContain("OX");
      expect(QUESTION_GENERATION_SYSTEM_PROMPT).toContain("RUBRIC");
    });

    it("includes JSON response format specification", () => {
      expect(QUESTION_GENERATION_SYSTEM_PROMPT).toContain('"questions"');
      expect(QUESTION_GENERATION_SYSTEM_PROMPT).toContain('"text"');
      expect(QUESTION_GENERATION_SYSTEM_PROMPT).toContain('"type"');
      expect(QUESTION_GENERATION_SYSTEM_PROMPT).toContain('"dimension"');
    });

    it("is written in Korean", () => {
      expect(QUESTION_GENERATION_SYSTEM_PROMPT).toContain("당신은");
      expect(QUESTION_GENERATION_SYSTEM_PROMPT).toContain("질문");
    });
  });

  describe("buildQuestionGenerationUserPrompt", () => {
    it("includes batch size request", () => {
      const prompt = buildQuestionGenerationUserPrompt([], [], 5, []);
      expect(prompt).toContain("5");
    });

    it("includes target dimensions when specified", () => {
      const prompt = buildQuestionGenerationUserPrompt(
        [],
        ["TECH_REGULATION", "WORK_LIFE"],
        5,
        [],
      );
      expect(prompt).toContain("TECH_REGULATION");
      expect(prompt).toContain("WORK_LIFE");
    });

    it("includes previous answer context", () => {
      const prompt = buildQuestionGenerationUserPrompt(
        [
          { questionId: "1", questionText: "AI 규제 질문", answerSummary: "찬성" },
        ],
        [],
        5,
        [],
      );
      expect(prompt).toContain("AI 규제 질문");
      expect(prompt).toContain("찬성");
    });

    it("mentions exclusion count when questions exist", () => {
      const prompt = buildQuestionGenerationUserPrompt(
        [],
        [],
        5,
        ["1", "2", "3"],
      );
      expect(prompt).toContain("3");
    });
  });
});
