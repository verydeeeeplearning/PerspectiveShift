import { FeatureFlag } from "@/domain/value-objects/feature-flag";

interface CheckFeatureFlagInput {
  name: string;
  enabled: boolean;
  rolloutPercentage?: number;
  userHash: number;
}

interface CheckFeatureFlagResult {
  name: string;
  isEnabled: boolean;
}

export class CheckFeatureFlagUseCase {
  execute(input: CheckFeatureFlagInput): CheckFeatureFlagResult {
    const flag = FeatureFlag.create({
      name: input.name,
      enabled: input.enabled,
      rolloutPercentage: input.rolloutPercentage,
    });
    return { name: flag.name, isEnabled: flag.isEnabledForUser(input.userHash) };
  }
}
