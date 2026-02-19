import type { DialogueStep } from "./dialogue-step";

export type { DialogueStep };

interface ScaffoldConfig {
  step: DialogueStep;
  placeholder: string;
}

const SCAFFOLD_MAP: Record<DialogueStep, string> = {
  AFFIRMATION: "",
  POSITION: "나는 ____에 대해 ____라고 생각해요. 왜냐하면 ____",
  QUESTION: "____라고 하셨는데, ____?",
  ANSWER: "제 생각에는 ____, 왜냐하면 ____",
  REFLECTION: "",
  JOINT_SUMMARY: "",
};

export class ScaffoldTemplate {
  readonly step: DialogueStep;
  readonly placeholder: string;

  private constructor(config: ScaffoldConfig) {
    this.step = config.step;
    this.placeholder = config.placeholder;
  }

  static forStep(step: DialogueStep): ScaffoldTemplate {
    return new ScaffoldTemplate({
      step,
      placeholder: SCAFFOLD_MAP[step],
    });
  }
}
