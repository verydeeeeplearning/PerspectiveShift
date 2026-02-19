const BAD_EXPERIENCE_THRESHOLD = 20;

interface PeakEndKPIProps {
  feelHeardSlider: number;
  rematchIntentSlider: number;
}

export class PeakEndKPI {
  readonly feelHeardSlider: number;
  readonly rematchIntentSlider: number;

  private constructor(props: PeakEndKPIProps) {
    this.feelHeardSlider = props.feelHeardSlider;
    this.rematchIntentSlider = props.rematchIntentSlider;
  }

  static create(props: PeakEndKPIProps): PeakEndKPI {
    return new PeakEndKPI({
      feelHeardSlider: Math.max(0, Math.min(100, props.feelHeardSlider)),
      rematchIntentSlider: Math.max(0, Math.min(100, props.rematchIntentSlider)),
    });
  }

  get affectiveWarmth(): number {
    return this.rematchIntentSlider;
  }

  get isBadExperience(): boolean {
    return this.feelHeardSlider < BAD_EXPERIENCE_THRESHOLD;
  }
}
