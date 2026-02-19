import { ABExperiment } from "@/domain/entities/ab-experiment";

interface GetExperimentVariantInput {
  experimentId: string;
  name: string;
  variants: string[];
  primaryMetric: string;
  guardrailMetric: string;
  userId: string;
}

interface GetExperimentVariantResult {
  experimentId: string;
  variant: string;
  userId: string;
}

export class GetExperimentVariantUseCase {
  execute(input: GetExperimentVariantInput): GetExperimentVariantResult {
    const exp = ABExperiment.create({
      experimentId: input.experimentId,
      name: input.name,
      variants: input.variants,
      primaryMetric: input.primaryMetric,
      guardrailMetric: input.guardrailMetric,
    });
    const variant = exp.assignVariant(input.userId);
    return { experimentId: input.experimentId, variant, userId: input.userId };
  }
}
