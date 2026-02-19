import type { QuestionPrecision } from "@/domain/value-objects/question-precision";

export interface QuestionData {
  id: number;
  text: string;
  type: "OX" | "RUBRIC" | "OPEN_ENDED";
  phase: "core" | "extended";
  allowUncertain?: boolean;
  tooltipText?: string;
}

export type AnswerMap = Record<number, boolean | number | string>;

export type OnboardingEventName =
  | "precision_select_5"
  | "precision_select_10"
  | "precision_select_20"
  | "precision_change_midway"
  | "question_answer_ox"
  | "question_answer_rubric"
  | "question_answer_open_ended"
  | "question_dontknow"
  | "coach_click"
  | "example_swipe";

export function getPrecisionSelectEvent(
  targetPrecision: QuestionPrecision,
): OnboardingEventName {
  if (targetPrecision === "quick") return "precision_select_5";
  if (targetPrecision === "standard") return "precision_select_10";
  return "precision_select_20";
}

export function toQuestionIdSet(questions: ReadonlyArray<QuestionData>): Set<number> {
  return new Set(questions.map((question) => question.id));
}

export function filterAnswersByQuestionSet(
  answers: AnswerMap,
  questionSet: Set<number>,
): AnswerMap {
  const filtered: AnswerMap = {};
  for (const [questionId, answer] of Object.entries(answers)) {
    const id = Number(questionId);
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
