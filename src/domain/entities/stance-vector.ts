import { StanceAxis } from "../value-objects/stance-axis";
import {
  type StanceDimension,
  ALL_DIMENSIONS,
} from "../value-objects/stance-dimension";
import { IncompleteStanceVectorError } from "../errors/domain-errors";

export type StanceAxesMap = Record<StanceDimension, StanceAxis>;

export class StanceVector {
  readonly axes: Readonly<StanceAxesMap>;

  private constructor(axes: StanceAxesMap) {
    this.axes = Object.freeze({ ...axes });
  }

  static create(axes: StanceAxesMap): StanceVector {
    const missing = ALL_DIMENSIONS.filter(
      (d) => axes[d] === undefined,
    );
    if (missing.length > 0) {
      throw new IncompleteStanceVectorError(missing);
    }
    return new StanceVector(axes);
  }

  static fromValues(
    values: Record<StanceDimension, number>,
  ): StanceVector {
    const axes = {} as StanceAxesMap;
    for (const dim of ALL_DIMENSIONS) {
      axes[dim] = StanceAxis.create(values[dim]);
    }
    return new StanceVector(axes);
  }

  static neutral(): StanceVector {
    const axes = {} as StanceAxesMap;
    for (const dim of ALL_DIMENSIONS) {
      axes[dim] = StanceAxis.neutral();
    }
    return new StanceVector(axes);
  }

  get(dimension: StanceDimension): StanceAxis {
    return this.axes[dimension];
  }

  toValues(): Record<StanceDimension, number> {
    const result = {} as Record<StanceDimension, number>;
    for (const dim of ALL_DIMENSIONS) {
      result[dim] = this.axes[dim].value;
    }
    return result;
  }

  cosineDistance(other: StanceVector): number {
    const a = ALL_DIMENSIONS.map((d) => this.axes[d].value);
    const b = ALL_DIMENSIONS.map((d) => other.axes[d].value);

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 1;

    const similarity =
      dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return 1 - similarity;
  }

  merge(
    partial: Partial<Record<StanceDimension, StanceAxis>>,
  ): StanceVector {
    const axes = { ...this.axes } as StanceAxesMap;
    for (const [dim, axis] of Object.entries(partial)) {
      if (axis !== undefined) {
        axes[dim as StanceDimension] = axis;
      }
    }
    return new StanceVector(axes);
  }
}
