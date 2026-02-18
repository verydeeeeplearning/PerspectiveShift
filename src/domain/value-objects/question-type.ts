export const QuestionType = {
  OX: "OX",
  RUBRIC: "RUBRIC",
  OPEN_ENDED: "OPEN_ENDED",
} as const;

export type QuestionType =
  (typeof QuestionType)[keyof typeof QuestionType];
