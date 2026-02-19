import { NextStepAction, type NextStepResult } from "@/domain/value-objects/next-step-action";

export interface DetermineNextStepInput {
  hasCompletedOnboarding: boolean;
  precisionLevel: number;
  hasActiveDialogue: boolean;
}

export class DetermineNextStepUseCase {
  execute(input: DetermineNextStepInput): NextStepResult {
    return NextStepAction.determine(input);
  }
}
