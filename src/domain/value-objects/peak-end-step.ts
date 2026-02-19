export const PEAK_END_STEPS = [
  "JOINT_SUMMARY",
  "GIFT_MESSAGE",
  "BLIND_SPOT",
  "KPI_COLLECTION",
  "TURING_TEST",
  "NEXT_QUESTION",
  "FINAL_CTA",
] as const;

export type PeakEndStepType = (typeof PEAK_END_STEPS)[number];

export class PeakEndStep {
  readonly current: PeakEndStepType;
  readonly index: number;

  private constructor(index: number) {
    this.index = index;
    this.current = PEAK_END_STEPS[index];
  }

  static first(): PeakEndStep {
    return new PeakEndStep(0);
  }

  get isComplete(): boolean {
    return this.index >= PEAK_END_STEPS.length;
  }

  get progress(): number {
    return this.index / PEAK_END_STEPS.length;
  }

  advance(): PeakEndStep {
    if (this.isComplete) throw new Error("Cannot advance past completed flow");
    return new PeakEndStep(this.index + 1);
  }
}
