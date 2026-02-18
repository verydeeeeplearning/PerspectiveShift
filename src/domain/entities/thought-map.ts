import type { StanceVector } from "./stance-vector";
import type { MapTypeName, MapTypeInfo } from "../value-objects/map-type";
import { classifyMapType, getMapTypeInfo } from "../value-objects/map-type";
import type { StanceDimension } from "../value-objects/stance-dimension";
import { ALL_DIMENSIONS } from "../value-objects/stance-dimension";

export interface PercentileEntry {
  dimension: StanceDimension;
  percentile: number;
}

export class ThoughtMap {
  readonly vector: StanceVector;
  readonly mapType: MapTypeInfo;
  readonly percentiles: readonly PercentileEntry[];
  readonly precision: "initial" | "refined";
  readonly createdAt: Date;

  private constructor(props: {
    vector: StanceVector;
    mapType: MapTypeInfo;
    percentiles: PercentileEntry[];
    precision: "initial" | "refined";
    createdAt: Date;
  }) {
    this.vector = props.vector;
    this.mapType = props.mapType;
    this.percentiles = Object.freeze(props.percentiles);
    this.precision = props.precision;
    this.createdAt = props.createdAt;
  }

  static create(props: {
    vector: StanceVector;
    percentiles: PercentileEntry[];
    precision: "initial" | "refined";
  }): ThoughtMap {
    const mapTypeName: MapTypeName = classifyMapType(props.vector.axes);
    const mapType = getMapTypeInfo(mapTypeName);

    return new ThoughtMap({
      vector: props.vector,
      mapType,
      percentiles: props.percentiles,
      precision: props.precision,
      createdAt: new Date(),
    });
  }

  getPercentile(dimension: StanceDimension): number | undefined {
    return this.percentiles.find(
      (p) => p.dimension === dimension,
    )?.percentile;
  }

  hasAllPercentiles(): boolean {
    return ALL_DIMENSIONS.every((d) =>
      this.percentiles.some((p) => p.dimension === d),
    );
  }
}
