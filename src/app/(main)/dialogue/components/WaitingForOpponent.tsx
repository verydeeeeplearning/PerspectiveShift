"use client";

import { TypingIndicator } from "../_components/TypingIndicator";

const STEP_LABELS: Record<string, string> = {
  POSITION: "position",
  QUESTION: "question",
  ANSWER: "answer",
  REFLECTION: "reflection",
};

interface WaitingForOpponentProps {
  currentStep: string;
}

export function WaitingForOpponent({
  currentStep,
}: WaitingForOpponentProps) {
  const stepLabel = STEP_LABELS[currentStep] ?? currentStep.toLowerCase();

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-8 text-center">
      <div className="mb-3 flex justify-center">
        <TypingIndicator />
      </div>
      <h3 className="mb-2 text-lg font-medium">
        Waiting for your partner&apos;s {stepLabel}
      </h3>
      <p className="text-sm text-gray-600">
        The next step starts automatically after their response is submitted.
      </p>
    </div>
  );
}

