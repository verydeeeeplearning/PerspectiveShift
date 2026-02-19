const BAD_EXPERIENCE_THRESHOLD = 20;
const TRAILER_LOW_QUALITY_THRESHOLD = 30;

interface PeakEndKPIProps {
  feelHeardSlider: number;
  rematchIntentSlider: number;
  trailerAccuracySlider?: number;
}

export class PeakEndKPI {
  readonly feelHeardSlider: number;
  readonly rematchIntentSlider: number;
  readonly trailerAccuracySlider: number;

  private constructor(props: Required<PeakEndKPIProps>) {
    this.feelHeardSlider = props.feelHeardSlider;
    this.rematchIntentSlider = props.rematchIntentSlider;
    this.trailerAccuracySlider = props.trailerAccuracySlider;
  }

  static create(props: PeakEndKPIProps): PeakEndKPI {
    const clamp = (v: number) => Math.max(0, Math.min(100, v));
    return new PeakEndKPI({
      feelHeardSlider: clamp(props.feelHeardSlider),
      rematchIntentSlider: clamp(props.rematchIntentSlider),
      trailerAccuracySlider: clamp(props.trailerAccuracySlider ?? 50),
    });
  }

  get affectiveWarmth(): number {
    return this.rematchIntentSlider;
  }

  get isBadExperience(): boolean {
    return this.feelHeardSlider < BAD_EXPERIENCE_THRESHOLD;
  }

  get isTrailerLowQuality(): boolean {
    return this.trailerAccuracySlider < TRAILER_LOW_QUALITY_THRESHOLD;
  }
}
