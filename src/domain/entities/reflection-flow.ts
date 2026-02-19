export const REFLECTION_STEPS = ["QUIZ", "VERIFICATION", "STEELMAN", "COMMON_GROUND"] as const;
export type ReflectionStep = (typeof REFLECTION_STEPS)[number];

const REQUIRED_STEPS: Set<ReflectionStep> = new Set(["QUIZ", "VERIFICATION"]);

const LIGHTWEIGHT_STEPS: readonly ReflectionStep[] = ["QUIZ", "VERIFICATION"];

export class ReflectionFlow {
  static readonly TOTAL_STEPS = REFLECTION_STEPS.length;

  readonly stepIndex: number;
  readonly lightweight: boolean;
  readonly maxQuizQuestions: number;
  readonly feelHeardThreshold: number;

  private constructor(
    stepIndex: number,
    lightweight: boolean,
    maxQuizQuestions: number,
    feelHeardThreshold: number,
  ) {
    this.stepIndex = stepIndex;
    this.lightweight = lightweight;
    this.maxQuizQuestions = maxQuizQuestions;
    this.feelHeardThreshold = feelHeardThreshold;
  }

  static create(): ReflectionFlow {
    return new ReflectionFlow(0, false, 3, 2);
  }

  static createLightweight(): ReflectionFlow {
    return new ReflectionFlow(0, true, 1, 2);
  }

  private get steps(): readonly ReflectionStep[] {
    return this.lightweight ? LIGHTWEIGHT_STEPS : REFLECTION_STEPS;
  }

  get currentStep(): ReflectionStep {
    return this.steps[this.stepIndex];
  }

  get isComplete(): boolean {
    return this.stepIndex >= this.steps.length;
  }

  get progress(): number {
    return this.stepIndex / this.steps.length;
  }

  get isStepRequired(): boolean {
    if (this.isComplete) return false;
    return REQUIRED_STEPS.has(this.currentStep);
  }

  shouldShowEditUI(feelHeardScore: number): boolean {
    return feelHeardScore <= this.feelHeardThreshold;
  }

  advance(): ReflectionFlow {
    if (this.isComplete) {
      throw new Error("Cannot advance past completed flow");
    }
    return new ReflectionFlow(
      this.stepIndex + 1,
      this.lightweight,
      this.maxQuizQuestions,
      this.feelHeardThreshold,
    );
  }
}
