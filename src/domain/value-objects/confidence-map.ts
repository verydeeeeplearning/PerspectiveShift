import type { StanceDimension } from "./stance-dimension";
import { ALL_DIMENSIONS } from "./stance-dimension";
import { ConfidenceLevel, type ConfidenceLevelKey } from "./confidence-level";

export class ConfidenceMap {
  private readonly entries: Record<StanceDimension, ConfidenceLevel>;

  private constructor(entries: Record<StanceDimension, ConfidenceLevel>) {
    this.entries = { ...entries };
  }

  static default(): ConfidenceMap {
    const entries = {} as Record<StanceDimension, ConfidenceLevel>;
    for (const dim of ALL_DIMENSIONS) {
      entries[dim] = ConfidenceLevel.create("MEDIUM");
    }
    return new ConfidenceMap(entries);
  }

  static fromEntries(
    partial: Partial<Record<StanceDimension, ConfidenceLevelKey>>,
  ): ConfidenceMap {
    const map = ConfidenceMap.default();
    const entries = { ...map.entries };
    for (const [dim, level] of Object.entries(partial)) {
      if (level) {
        entries[dim as StanceDimension] = ConfidenceLevel.create(level);
      }
    }
    return new ConfidenceMap(entries);
  }

  get(dimension: StanceDimension): ConfidenceLevel {
    return this.entries[dimension];
  }

  update(dimension: StanceDimension, level: ConfidenceLevel): ConfidenceMap {
    const entries = { ...this.entries };
    entries[dimension] = level;
    return new ConfidenceMap(entries);
  }

  toRecord(): Record<StanceDimension, ConfidenceLevelKey> {
    const record = {} as Record<StanceDimension, ConfidenceLevelKey>;
    for (const dim of ALL_DIMENSIONS) {
      record[dim] = this.entries[dim].value;
    }
    return record;
  }
}
