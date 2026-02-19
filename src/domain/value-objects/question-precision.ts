export type QuestionPrecision = "quick" | "standard" | "detailed";

export interface QuestionPrecisionConfig {
  totalQuestions: number;
  estimatedMinutes: number;
  label: string;
}

export const QUESTION_PRECISION_CONFIG: Record<
  QuestionPrecision,
  QuestionPrecisionConfig
> = {
  quick: {
    totalQuestions: 5,
    estimatedMinutes: 2,
    label: "빠르게 시작",
  },
  standard: {
    totalQuestions: 10,
    estimatedMinutes: 4,
    label: "표준 분석",
  },
  detailed: {
    totalQuestions: 20,
    estimatedMinutes: 9,
    label: "정밀 분석",
  },
};
