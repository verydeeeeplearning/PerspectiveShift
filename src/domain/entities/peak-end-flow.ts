export const PEAK_END_STEPS = [
  "JOINT_SUMMARY",
  "GIFT",
  "BLIND_SPOT",
  "KPI",
  "NEXT_QUESTION",
] as const;

export type PeakEndStep = (typeof PEAK_END_STEPS)[number];

export class PeakEndFlow {
  static readonly TOTAL_STEPS = PEAK_END_STEPS.length;

  readonly stepIndex: number;

  private constructor(stepIndex: number) {
    this.stepIndex = stepIndex;
  }

  static create(): PeakEndFlow {
    return new PeakEndFlow(0);
  }

  get currentStep(): PeakEndStep {
    return PEAK_END_STEPS[this.stepIndex];
  }

  get isComplete(): boolean {
    return this.stepIndex >= PEAK_END_STEPS.length;
  }

  get progress(): number {
    return this.stepIndex / PEAK_END_STEPS.length;
  }

  advance(): PeakEndFlow {
    if (this.isComplete) throw new Error("Cannot advance past completed flow");
    return new PeakEndFlow(this.stepIndex + 1);
  }
}
