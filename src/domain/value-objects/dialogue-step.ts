export const DIALOGUE_STEPS = [
  "AFFIRMATION",
  "POSITION",
  "QUESTION",
  "ANSWER",
  "REFLECTION",
  "JOINT_SUMMARY",
] as const;

export type DialogueStep = (typeof DIALOGUE_STEPS)[number];

const STEP_ORDER: Record<DialogueStep, number> = {
  AFFIRMATION: 0,
  POSITION: 1,
  QUESTION: 2,
  ANSWER: 3,
  REFLECTION: 4,
  JOINT_SUMMARY: 5,
};

export function stepOrder(step: DialogueStep): number {
  return STEP_ORDER[step];
}

export function nextStep(step: DialogueStep): DialogueStep | null {
  const order = STEP_ORDER[step];
  const next = DIALOGUE_STEPS[order + 1];
  return next ?? null;
}

export function isValidStep(value: string): value is DialogueStep {
  return DIALOGUE_STEPS.includes(value as DialogueStep);
}

export function isFinalStep(step: DialogueStep): boolean {
  return step === "JOINT_SUMMARY";
}

/** Steps for QUICK effort grade (5min) — skip AFFIRMATION, QUESTION, ANSWER */
export const QUICK_STEPS: DialogueStep[] = [
  "POSITION",
  "REFLECTION",
];

/** Steps for STRUCTURED effort grade (15min) — full 6 steps */
export const STRUCTURED_STEPS: DialogueStep[] = [...DIALOGUE_STEPS];

/** Steps for DEEP effort grade (30min+) — full 6 steps (extended rounds handled by session) */
export const DEEP_STEPS: DialogueStep[] = [...DIALOGUE_STEPS];

export function getStepsForEffort(
  effortGrade: "QUICK" | "STRUCTURED" | "DEEP",
): DialogueStep[] {
  switch (effortGrade) {
    case "QUICK":
      return QUICK_STEPS;
    case "STRUCTURED":
    case "DEEP":
      return STRUCTURED_STEPS;
  }
}
