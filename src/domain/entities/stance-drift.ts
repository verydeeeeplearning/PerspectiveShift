const MIN_DIALOGUE_COUNT = 4;
const MIN_DRIFT_THRESHOLD = 0.2;

interface AxisDrift {
  axis: string;
  previousValue: number;
  currentValue: number;
  drift: number;
}

interface StanceDriftProps {
  userId: string;
  dialogueCount: number;
  driftByAxis: AxisDrift[];
  lastNotifiedAt: Date | null;
}

export class StanceDrift {
  readonly userId: string;
  readonly dialogueCount: number;
  readonly driftByAxis: readonly AxisDrift[];
  readonly lastNotifiedAt: Date | null;

  private constructor(props: StanceDriftProps) {
    this.userId = props.userId;
    this.dialogueCount = props.dialogueCount;
    this.driftByAxis = Object.freeze([...props.driftByAxis]);
    this.lastNotifiedAt = props.lastNotifiedAt;
  }

  static create(props: StanceDriftProps): StanceDrift {
    return new StanceDrift(props);
  }

  get significantDrifts(): readonly AxisDrift[] {
    return this.driftByAxis.filter((d) => Math.abs(d.drift) >= MIN_DRIFT_THRESHOLD);
  }

  get hasEnoughDialogues(): boolean {
    return this.dialogueCount >= MIN_DIALOGUE_COUNT;
  }

  get canNotify(): boolean {
    if (!this.hasEnoughDialogues) return false;
    if (this.significantDrifts.length === 0) return false;
    if (this.lastNotifiedAt) {
      const daysSince = (Date.now() - this.lastNotifiedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 30) return false;
    }
    return true;
  }
}
