export const MetricTier = {
  EXPERIENCE: "EXPERIENCE",
  COGNITIVE: "COGNITIVE",
  AFFECTIVE: "AFFECTIVE",
} as const;

export type MetricTierType = (typeof MetricTier)[keyof typeof MetricTier];

export const METRIC_MAPPINGS: Record<string, MetricTierType> = {
  satisfaction: MetricTier.EXPERIENCE,
  feelHeardScore: MetricTier.EXPERIENCE,
  rematchWillingness: MetricTier.EXPERIENCE,
  understandingScore: MetricTier.COGNITIVE,
  receptiveness: MetricTier.COGNITIVE,
  summaryAccuracy: MetricTier.COGNITIVE,
  affectiveWarmth: MetricTier.AFFECTIVE,
  avoidanceReduction: MetricTier.AFFECTIVE,
  emotionCheckIn: MetricTier.AFFECTIVE,
};

export function getMetricTier(metricName: string): MetricTierType {
  const tier = METRIC_MAPPINGS[metricName];
  if (!tier) {
    throw new Error(`Unknown metric: ${metricName}`);
  }
  return tier;
}
