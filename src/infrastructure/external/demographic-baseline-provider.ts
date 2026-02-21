import type {
  BaselineProvider,
  BaselineData,
} from "@/domain/interfaces/baseline-provider";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";
import { ALL_DIMENSIONS } from "@/domain/value-objects/stance-dimension";
import demographicData from "./data/demographic-baseline.json";

interface DemographicGroup {
  ageGroup: string;
  jobCategory: string;
  dimensions: Record<string, { mean: number; stdDev: number }>;
  confidence?: string;
}

/**
 * Maps UI DemographicStep categories to report.json categories.
 */
const AGE_MAP: Record<string, string> = {
  "10대": "10대",
  "20대": "20대",
  "30대": "30대",
  "40대": "40대",
  "50대": "50대",
  "60대 이상": "60대",
};

const JOB_MAP: Record<string, string> = {
  "학생": "학생",
  "IT/개발": "IT·테크",
  "교육": "교육",
  "사무/경영": "공무원", // closest office/admin match
  "전문직": "법조",      // closest professional match
  "자영업": "자영업",
  "프리랜서/창작": "예술·문화",
  "기타": "기타",
  // Direct matches for the full report.json categories
  "IT·테크": "IT·테크",
  "공무원": "공무원",
  "군·경찰": "군·경찰",
  "금융": "금융",
  "농림어업": "농림어업",
  "무직·은퇴": "무직·은퇴",
  "법조": "법조",
  "서비스업": "서비스업",
  "예술·문화": "예술·문화",
  "의료": "의료",
  "제조·생산": "제조·생산",
};

export class DemographicBaselineProvider implements BaselineProvider {
  private group: DemographicGroup;
  private demographicLabel: string;

  constructor(
    ageGroup?: string,
    jobCategory?: string,
  ) {
    const groups = (demographicData as { groups: DemographicGroup[] }).groups;
    this.group = this.findBestGroup(groups, ageGroup, jobCategory);
    this.demographicLabel = this.buildLabel(ageGroup, jobCategory);
  }

  private findBestGroup(
    groups: DemographicGroup[],
    ageGroup?: string,
    jobCategory?: string,
  ): DemographicGroup {
    const mappedAge = ageGroup ? (AGE_MAP[ageGroup] ?? ageGroup) : undefined;
    const mappedJob = jobCategory ? (JOB_MAP[jobCategory] ?? jobCategory) : undefined;

    // 1. Try exact match (age × job)
    if (mappedAge && mappedJob) {
      const exact = groups.find(
        (g) => g.ageGroup === mappedAge && g.jobCategory === mappedJob,
      );
      if (exact) return exact;
    }

    // 2. Fallback: age-only marginal (jobCategory = "전체")
    if (mappedAge) {
      const ageOnly = groups.find(
        (g) => g.ageGroup === mappedAge && g.jobCategory === "전체",
      );
      if (ageOnly) return ageOnly;
    }

    // 3. Fallback: job-only marginal (ageGroup = "전체")
    if (mappedJob) {
      const jobOnly = groups.find(
        (g) => g.ageGroup === "전체" && g.jobCategory === mappedJob,
      );
      if (jobOnly) return jobOnly;
    }

    // 4. Grand fallback: overall population (전체 × 전체)
    const overall = groups.find(
      (g) => g.ageGroup === "전체" && g.jobCategory === "전체",
    );
    if (overall) return overall;

    // 5. Last resort: first group
    return groups[0];
  }

  private buildLabel(ageGroup?: string, jobCategory?: string): string {
    if (ageGroup && jobCategory) {
      return `${ageGroup} · ${jobCategory} 대비`;
    }
    if (ageGroup) {
      return `${ageGroup} 대비`;
    }
    if (jobCategory) {
      return `${jobCategory} 대비`;
    }
    return "전체 응답자 대비";
  }

  getBaseline(): BaselineData {
    const dimensions = {} as Record<
      StanceDimension,
      { mean: number; std: number; sampleSize: number }
    >;

    for (const dim of ALL_DIMENSIONS) {
      const d = this.group.dimensions[dim];
      if (d) {
        dimensions[dim] = {
          mean: d.mean,
          std: d.stdDev,
          sampleSize: 1000, // survey-based estimate
        };
      } else {
        dimensions[dim] = { mean: 0, std: 0.4, sampleSize: 0 };
      }
    }

    return {
      label: this.demographicLabel,
      dimensions,
    };
  }

  calculatePercentile(
    dimension: StanceDimension,
    value: number,
  ): number {
    const d = this.group.dimensions[dimension];
    if (!d || d.stdDev === 0) return 50;

    const z = (value - d.mean) / d.stdDev;
    const percentile = this.normalCdf(z) * 100;

    return Math.round(Math.max(1, Math.min(99, percentile)));
  }

  getOppositeDistribution(
    dimension: StanceDimension,
    stanceValue: number,
  ): number {
    const d = this.group.dimensions[dimension];
    if (!d) return 0;

    const dampening = 0.6;
    const deviation = stanceValue - d.mean;
    return Math.max(-1, Math.min(1, d.mean - deviation * dampening));
  }

  getDemographicLabel(): string {
    return this.demographicLabel;
  }

  private normalCdf(z: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = z < 0 ? -1 : 1;
    const absZ = Math.abs(z);
    const t = 1.0 / (1.0 + p * absZ);
    const y =
      1.0 -
      ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
        t *
        Math.exp(-absZ * absZ / 2);

    return 0.5 * (1.0 + sign * y);
  }
}
