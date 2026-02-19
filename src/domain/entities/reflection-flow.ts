export const REFLECTION_STEPS = ["QUIZ", "VERIFICATION", "STEELMAN", "COMMON_GROUND"] as const;
export type ReflectionStep = (typeof REFLECTION_STEPS)[number];

const REQUIRED_STEPS: Set<ReflectionStep> = new Set(["QUIZ", "VERIFICATION"]);

export class ReflectionFlow {
  static readonly TOTAL_STEPS = REFLECTION_STEPS.length;

  readonly stepIndex: number;

  private constructor(stepIndex: number) {
    this.stepIndex = stepIndex;
  }

  static create(): ReflectionFlow {
    return new ReflectionFlow(0);
  }

  get currentStep(): ReflectionStep {
    return REFLECTION_STEPS[this.stepIndex];
  }

  get isComplete(): boolean {
    return this.stepIndex >= REFLECTION_STEPS.length;
  }

  get progress(): number {
    return this.stepIndex / REFLECTION_STEPS.length;
  }

  get isStepRequired(): boolean {
    if (this.isComplete) return false;
    return REQUIRED_STEPS.has(this.currentStep);
  }

  advance(): ReflectionFlow {
    if (this.isComplete) {
      throw new Error("Cannot advance past completed flow");
    }
    return new ReflectionFlow(this.stepIndex + 1);
  }
}
