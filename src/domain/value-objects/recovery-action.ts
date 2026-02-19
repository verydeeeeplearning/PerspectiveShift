interface RecoveryActionProps {
  topicLevel?: number;
  distanceBandMin?: number;
  distanceBandMax?: number;
  facilitatorIntensity?: number;
  dialogueExcluded?: boolean;
}

export class RecoveryAction {
  readonly topicLevel: number;
  readonly distanceBandMin: number;
  readonly distanceBandMax: number;
  readonly facilitatorIntensity: number;
  readonly dialogueExcluded: boolean;

  private constructor(props: Required<RecoveryActionProps>) {
    this.topicLevel = props.topicLevel;
    this.distanceBandMin = props.distanceBandMin;
    this.distanceBandMax = props.distanceBandMax;
    this.facilitatorIntensity = props.facilitatorIntensity;
    this.dialogueExcluded = props.dialogueExcluded;
  }

  static createDefault(): RecoveryAction {
    return new RecoveryAction({
      topicLevel: 0,
      distanceBandMin: 0.2,
      distanceBandMax: 0.3,
      facilitatorIntensity: 1.0,
      dialogueExcluded: true,
    });
  }

  static create(props: RecoveryActionProps): RecoveryAction {
    return new RecoveryAction({
      topicLevel: props.topicLevel ?? 0,
      distanceBandMin: props.distanceBandMin ?? 0.2,
      distanceBandMax: props.distanceBandMax ?? 0.3,
      facilitatorIntensity: props.facilitatorIntensity ?? 1.0,
      dialogueExcluded: props.dialogueExcluded ?? true,
    });
  }
}
