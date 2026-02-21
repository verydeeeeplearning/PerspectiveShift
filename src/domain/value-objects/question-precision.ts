export type QuestionPrecision = "lite" | "standard" | "deep" | "comprehensive";

export interface QuestionPrecisionConfig {
  totalQuestions: number;
  estimatedMinutes: number;
  label: string;
}

export const QUESTION_PRECISION_CONFIG: Record<
  QuestionPrecision,
  QuestionPrecisionConfig
> = {
  lite: {
    totalQuestions: 10,
    estimatedMinutes: 3,
    label: "라이트",
  },
  standard: {
    totalQuestions: 20,
    estimatedMinutes: 7,
    label: "표준 분석",
  },
  deep: {
    totalQuestions: 30,
    estimatedMinutes: 12,
    label: "심층 분석",
  },
  comprehensive: {
    totalQuestions: 50,
    estimatedMinutes: 20,
    label: "종합 분석",
  },
};
