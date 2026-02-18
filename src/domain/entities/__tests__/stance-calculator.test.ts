import { describe, it, expect } from "vitest";
import { StanceCalculator } from "../stance-calculator";
import { Answer } from "../answer";
import { Question } from "../question";
import { QuestionType } from "../../value-objects/question-type";
import { StanceDimension } from "../../value-objects/stance-dimension";
import { InsufficientAnswersError } from "../../errors/domain-errors";

const CORE_QUESTIONS = [
  Question.create({
    id: 1,
    text: "AI 기술 발전에 대한 정부의 규제가 더 강화되어야 한다",
    type: QuestionType.OX,
    dimension: StanceDimension.TECH_REGULATION,
    phase: "core",
    polarity: 1,
  }),
  Question.create({
    id: 2,
    text: "고소득자의 세금을 높여 복지를 확대해야 한다",
    type: QuestionType.OX,
    dimension: StanceDimension.REDISTRIBUTION,
    phase: "core",
    polarity: 1,
  }),
  Question.create({
    id: 3,
    text: "개인의 경제적 성공은 주로 본인의 노력에 달려 있다",
    type: QuestionType.OX,
    dimension: StanceDimension.MERITOCRACY,
    phase: "core",
    polarity: 1,
  }),
  Question.create({
    id: 4,
    text: "회사가 야근을 완전히 금지해야 한다",
    type: QuestionType.RUBRIC,
    dimension: StanceDimension.WORK_LIFE,
    phase: "core",
    polarity: 1,
  }),
  Question.create({
    id: 5,
    text: "AI가 일자리를 빼앗기보다 더 많은 기회를 만들 것이다",
    type: QuestionType.RUBRIC,
    dimension: StanceDimension.TECH_OPTIMISM,
    phase: "core",
    polarity: 1,
  }),
];

const EXTENDED_QUESTIONS = [
  Question.create({
    id: 6,
    text: "대학 입시에서 지역/소득 기반 정원 할당이 필요하다",
    type: QuestionType.OX,
    dimension: StanceDimension.OPPORTUNITY_EQUALITY,
    phase: "extended",
    polarity: 1,
  }),
];

describe("StanceCalculator", () => {
  describe("calculateFromAnswers", () => {
    it("calculates vector from all core answers", () => {
      const answers = [
        Answer.ox(1, true),
        Answer.ox(2, true),
        Answer.ox(3, false),
        Answer.rubric(4, 5),
        Answer.rubric(5, 4),
      ];

      const vector = StanceCalculator.calculateFromAnswers(
        answers,
        CORE_QUESTIONS,
      );

      expect(
        vector.get(StanceDimension.TECH_REGULATION).value,
      ).toBe(1);
      expect(vector.get(StanceDimension.REDISTRIBUTION).value).toBe(1);
      expect(vector.get(StanceDimension.MERITOCRACY).value).toBe(-1);
      expect(vector.get(StanceDimension.WORK_LIFE).value).toBe(1);
      expect(vector.get(StanceDimension.TECH_OPTIMISM).value).toBe(0.5);
    });

    it("throws when missing core answers", () => {
      const answers = [Answer.ox(1, true), Answer.ox(2, true)];
      expect(() =>
        StanceCalculator.calculateFromAnswers(
          answers,
          CORE_QUESTIONS,
        ),
      ).toThrow(InsufficientAnswersError);
    });

    it("handles OX with negative polarity", () => {
      const questions = [
        Question.create({
          id: 1,
          text: "Test",
          type: QuestionType.OX,
          dimension: StanceDimension.TECH_REGULATION,
          phase: "core",
          polarity: -1,
        }),
        ...CORE_QUESTIONS.slice(1),
      ];

      const answers = [
        Answer.ox(1, true),
        Answer.ox(2, true),
        Answer.ox(3, true),
        Answer.rubric(4, 3),
        Answer.rubric(5, 3),
      ];

      const vector = StanceCalculator.calculateFromAnswers(
        answers,
        questions,
      );
      expect(
        vector.get(StanceDimension.TECH_REGULATION).value,
      ).toBe(-1);
    });

    it("normalizes rubric score 3 to 0", () => {
      const answers = [
        Answer.ox(1, true),
        Answer.ox(2, true),
        Answer.ox(3, true),
        Answer.rubric(4, 3),
        Answer.rubric(5, 3),
      ];

      const vector = StanceCalculator.calculateFromAnswers(
        answers,
        CORE_QUESTIONS,
      );
      expect(vector.get(StanceDimension.WORK_LIFE).value).toBe(0);
      expect(vector.get(StanceDimension.TECH_OPTIMISM).value).toBe(0);
    });

    it("normalizes rubric score 1 to -1", () => {
      const answers = [
        Answer.ox(1, true),
        Answer.ox(2, true),
        Answer.ox(3, true),
        Answer.rubric(4, 1),
        Answer.rubric(5, 3),
      ];

      const vector = StanceCalculator.calculateFromAnswers(
        answers,
        CORE_QUESTIONS,
      );
      expect(vector.get(StanceDimension.WORK_LIFE).value).toBe(-1);
    });

    it("averages when multiple questions map to same dimension", () => {
      const allQuestions = [...CORE_QUESTIONS, ...EXTENDED_QUESTIONS];
      const answers = [
        Answer.ox(1, true),
        Answer.ox(2, true),
        Answer.ox(3, true),
        Answer.rubric(4, 3),
        Answer.rubric(5, 3),
        Answer.ox(6, false),
      ];

      const vector = StanceCalculator.calculateFromAnswers(
        answers,
        allQuestions,
      );

      expect(
        vector.get(StanceDimension.OPPORTUNITY_EQUALITY).value,
      ).toBe(-1);
    });

    it("ignores open-ended answers for calculation", () => {
      const questionsWithOpen = [
        ...CORE_QUESTIONS,
        Question.create({
          id: 9,
          text: "서술형 질문",
          type: QuestionType.OPEN_ENDED,
          dimension: StanceDimension.TECH_REGULATION,
          phase: "extended",
          polarity: 1,
        }),
      ];

      const answers = [
        Answer.ox(1, true),
        Answer.ox(2, true),
        Answer.ox(3, true),
        Answer.rubric(4, 3),
        Answer.rubric(5, 3),
        Answer.openEnded(9, "Some text"),
      ];

      const vector = StanceCalculator.calculateFromAnswers(
        answers,
        questionsWithOpen,
      );
      expect(
        vector.get(StanceDimension.TECH_REGULATION).value,
      ).toBe(1);
    });
  });

  describe("mergeWithLlmAxes", () => {
    it("blends LLM axes with code-calculated vector", () => {
      const codeVector = StanceCalculator.calculateFromAnswers(
        [
          Answer.ox(1, true),
          Answer.ox(2, true),
          Answer.ox(3, true),
          Answer.rubric(4, 3),
          Answer.rubric(5, 3),
        ],
        CORE_QUESTIONS,
      );

      const merged = StanceCalculator.mergeWithLlmAxes(
        codeVector,
        { TECH_REGULATION: -0.5 },
        0.3,
      );

      const expected = 1.0 * 0.7 + -0.5 * 0.3;
      expect(
        merged.get(StanceDimension.TECH_REGULATION).value,
      ).toBeCloseTo(expected, 2);
    });

    it("preserves unaffected dimensions", () => {
      const codeVector = StanceCalculator.calculateFromAnswers(
        [
          Answer.ox(1, true),
          Answer.ox(2, true),
          Answer.ox(3, true),
          Answer.rubric(4, 5),
          Answer.rubric(5, 3),
        ],
        CORE_QUESTIONS,
      );

      const merged = StanceCalculator.mergeWithLlmAxes(
        codeVector,
        { TECH_REGULATION: 0 },
        0.3,
      );

      expect(
        merged.get(StanceDimension.WORK_LIFE).value,
      ).toBe(codeVector.get(StanceDimension.WORK_LIFE).value);
    });
  });
});
