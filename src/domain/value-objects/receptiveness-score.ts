export interface ReceptivenessScoreProps {
  userId: string;
  totalPoints: number;
  templateAdoptions: number;
  feelHeardReceived: number;
  percentile: number | null;
}

const TEMPLATE_ADOPTION_POINTS = 5;
const FEEL_HEARD_4_POINTS = 10;
const FEEL_HEARD_5_POINTS = 15;

export class ReceptivenessScore {
  readonly userId: string;
  readonly totalPoints: number;
  readonly templateAdoptions: number;
  readonly feelHeardReceived: number;
  readonly percentile: number | null;

  private constructor(props: ReceptivenessScoreProps) {
    this.userId = props.userId;
    this.totalPoints = props.totalPoints;
    this.templateAdoptions = props.templateAdoptions;
    this.feelHeardReceived = props.feelHeardReceived;
    this.percentile = props.percentile;
  }

  static initial(userId: string): ReceptivenessScore {
    return new ReceptivenessScore({
      userId,
      totalPoints: 0,
      templateAdoptions: 0,
      feelHeardReceived: 0,
      percentile: null,
    });
  }

  static reconstitute(props: ReceptivenessScoreProps): ReceptivenessScore {
    return new ReceptivenessScore(props);
  }

  addTemplateAdoption(): ReceptivenessScore {
    return new ReceptivenessScore({
      userId: this.userId,
      totalPoints: this.totalPoints + TEMPLATE_ADOPTION_POINTS,
      templateAdoptions: this.templateAdoptions + 1,
      feelHeardReceived: this.feelHeardReceived,
      percentile: this.percentile,
    });
  }

  addFeelHeardBonus(score: number): ReceptivenessScore {
    if (score < 4) {
      return new ReceptivenessScore({
        userId: this.userId,
        totalPoints: this.totalPoints,
        templateAdoptions: this.templateAdoptions,
        feelHeardReceived: this.feelHeardReceived,
        percentile: this.percentile,
      });
    }

    const bonus = score >= 5 ? FEEL_HEARD_5_POINTS : FEEL_HEARD_4_POINTS;
    return new ReceptivenessScore({
      userId: this.userId,
      totalPoints: this.totalPoints + bonus,
      templateAdoptions: this.templateAdoptions,
      feelHeardReceived: this.feelHeardReceived + 1,
      percentile: this.percentile,
    });
  }

  withPercentile(percentile: number): ReceptivenessScore {
    return new ReceptivenessScore({
      userId: this.userId,
      totalPoints: this.totalPoints,
      templateAdoptions: this.templateAdoptions,
      feelHeardReceived: this.feelHeardReceived,
      percentile,
    });
  }
}
