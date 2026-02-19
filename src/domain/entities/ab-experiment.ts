interface ABExperimentProps {
  experimentId: string;
  name: string;
  variants: string[];
  primaryMetric: string;
  guardrailMetric: string;
}

export class ABExperiment {
  readonly experimentId: string;
  readonly name: string;
  readonly variants: readonly string[];
  readonly primaryMetric: string;
  readonly guardrailMetric: string;

  private constructor(props: ABExperimentProps) {
    this.experimentId = props.experimentId;
    this.name = props.name;
    this.variants = Object.freeze([...props.variants]);
    this.primaryMetric = props.primaryMetric;
    this.guardrailMetric = props.guardrailMetric;
  }

  static create(props: ABExperimentProps): ABExperiment {
    if (props.variants.length < 2) throw new Error("Must have at least 2 variants");
    return new ABExperiment(props);
  }

  assignVariant(userId: string): string {
    let hash = 0;
    const key = `${this.experimentId}:${userId}`;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
    }
    const index = Math.abs(hash) % this.variants.length;
    return this.variants[index];
  }
}
