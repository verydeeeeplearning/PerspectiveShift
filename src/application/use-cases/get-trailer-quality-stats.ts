const EMERGENCY_REVIEW_THRESHOLD = 30;

interface TrailerKPIRecord {
  trailerAccuracySlider: number;
}

export interface TrailerQualityStats {
  totalCount: number;
  averageAccuracy: number;
  flaggedCount: number;
  flaggedRate: number;
  needsEmergencyReview: boolean;
}

export class GetTrailerQualityStatsUseCase {
  execute(records: TrailerKPIRecord[]): TrailerQualityStats {
    if (records.length === 0) {
      return {
        totalCount: 0,
        averageAccuracy: 0,
        flaggedCount: 0,
        flaggedRate: 0,
        needsEmergencyReview: false,
      };
    }

    const total = records.length;
    const sum = records.reduce((acc, r) => acc + r.trailerAccuracySlider, 0);
    const avg = Math.round(sum / total);
    const flagged = records.filter((r) => r.trailerAccuracySlider < EMERGENCY_REVIEW_THRESHOLD).length;

    return {
      totalCount: total,
      averageAccuracy: avg,
      flaggedCount: flagged,
      flaggedRate: Math.round((flagged / total) * 100),
      needsEmergencyReview: avg < EMERGENCY_REVIEW_THRESHOLD,
    };
  }
}
