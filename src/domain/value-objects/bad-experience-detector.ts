const FEEL_HEARD_THRESHOLD = 20;

interface BadExperienceDetectorProps {
  feelHeardScore: number;
  emotionalCheckinNegative: boolean;
}

export class BadExperienceDetector {
  readonly feelHeardScore: number;
  readonly emotionalCheckinNegative: boolean;

  private constructor(props: BadExperienceDetectorProps) {
    this.feelHeardScore = props.feelHeardScore;
    this.emotionalCheckinNegative = props.emotionalCheckinNegative;
  }

  static create(props: BadExperienceDetectorProps): BadExperienceDetector {
    return new BadExperienceDetector(props);
  }

  static shouldTrigger(feelHeardScore: number, emotionalCheckinNegative: boolean): boolean {
    return feelHeardScore < FEEL_HEARD_THRESHOLD || emotionalCheckinNegative;
  }

  get triggered(): boolean {
    return BadExperienceDetector.shouldTrigger(this.feelHeardScore, this.emotionalCheckinNegative);
  }
}
