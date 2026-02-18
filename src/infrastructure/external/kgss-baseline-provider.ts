import type {
  BaselineProvider,
  BaselineData,
} from "@/domain/interfaces/baseline-provider";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";
import baselineData from "./data/kgss-baseline.json";

export class KgssBaselineProvider implements BaselineProvider {
  private data: BaselineData;

  constructor() {
    this.data = {
      label: baselineData.label,
      dimensions: baselineData.dimensions as BaselineData["dimensions"],
    };
  }

  getBaseline(): BaselineData {
    return this.data;
  }

  calculatePercentile(
    dimension: StanceDimension,
    value: number,
  ): number {
    const dist = this.data.dimensions[dimension];
    if (!dist) return 50;

    const z = (value - dist.mean) / dist.std;
    const percentile = this.normalCdf(z) * 100;

    return Math.round(Math.max(1, Math.min(99, percentile)));
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
