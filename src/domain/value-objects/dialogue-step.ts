export const DIALOGUE_STEPS = [
  "POSITION",
  "QUESTION",
  "ANSWER",
  "REFLECTION",
] as const;

export type DialogueStep = (typeof DIALOGUE_STEPS)[number];

const STEP_ORDER: Record<DialogueStep, number> = {
  POSITION: 0,
  QUESTION: 1,
  ANSWER: 2,
  REFLECTION: 3,
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
  return step === "REFLECTION";
}
