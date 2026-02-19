import { ScaffoldTemplate, type DialogueStep } from "@/domain/value-objects/scaffold-template";

export interface ScaffoldResult {
  step: DialogueStep;
  placeholder: string;
}

export class GetScaffoldForStepUseCase {
  execute(step: DialogueStep): ScaffoldResult {
    const scaffold = ScaffoldTemplate.forStep(step);
    return { step: scaffold.step, placeholder: scaffold.placeholder };
  }
}
