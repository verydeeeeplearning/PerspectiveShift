interface FeatureFlagProps {
  name: string;
  enabled: boolean;
  variant?: string;
  rolloutPercentage?: number;
}

export class FeatureFlag {
  readonly name: string;
  readonly enabled: boolean;
  readonly variant: string | null;
  readonly rolloutPercentage: number;

  private constructor(props: FeatureFlagProps) {
    this.name = props.name;
    this.enabled = props.enabled;
    this.variant = props.variant ?? null;
    this.rolloutPercentage = props.rolloutPercentage ?? 100;
  }

  static create(props: FeatureFlagProps): FeatureFlag {
    return new FeatureFlag(props);
  }

  isEnabledForUser(userHash: number): boolean {
    if (!this.enabled) return false;
    return (userHash % 100) < this.rolloutPercentage;
  }
}
