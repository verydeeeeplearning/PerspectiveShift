import type { QuestionPrecision } from "@/domain/value-objects/question-precision";

export interface QuestionData {
  id: number | string;
  text: string;
  type: "OX" | "RUBRIC" | "OPEN_ENDED";
  phase: "core" | "extended" | "generated";
  dimension?: string;
  polarity?: 1 | -1;
  allowUncertain?: boolean;
  tooltipText?: string;
}

export type AnswerMap = Record<number | string, boolean | number | string>;

export type OnboardingEventName =
  | "precision_select_10"
  | "precision_select_20"
  | "precision_select_30"
  | "precision_select_50"
  | "precision_change_midway"
  | "question_answer_ox"
  | "question_answer_rubric"
  | "question_answer_open_ended"
  | "question_dontknow"
  | "coach_click"
  | "example_swipe"
  | "batch_loading"
  | "batch_loaded";

export function getPrecisionSelectEvent(
  targetPrecision: QuestionPrecision,
): OnboardingEventName {
  if (targetPrecision === "lite") return "precision_select_10";
  if (targetPrecision === "standard") return "precision_select_20";
  if (targetPrecision === "deep") return "precision_select_30";
  return "precision_select_50";
}

export function toQuestionIdSet(questions: ReadonlyArray<QuestionData>): Set<number | string> {
  return new Set(questions.map((question) => question.id));
}

export function filterAnswersByQuestionSet(
  answers: AnswerMap,
  questionSet: Set<number | string>,
): AnswerMap {
  const filtered: AnswerMap = {};
  for (const [questionId, answer] of Object.entries(answers)) {
    const numericId = Number(questionId);
    const id = Number.isNaN(numericId) ? questionId : numericId;
    if (questionSet.has(id)) {
      filtered[id] = answer;
    }
  }
  return filtered;
}

export function emitOnboardingEvent(
  eventName: OnboardingEventName,
  onEvent?: (eventName: OnboardingEventName) => void,
): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("perspectiveshift:analytics", {
        detail: {
          type: eventName,
          payload: { timestamp: Date.now() },
        },
      }),
    );
  }
  onEvent?.(eventName);
}
