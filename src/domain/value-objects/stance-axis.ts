import { InvalidStanceAxisError } from "../errors/domain-errors";

const MIN = -1.0;
const MAX = 1.0;

export class StanceAxis {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(value: number): StanceAxis {
    if (value < MIN || value > MAX || !Number.isFinite(value)) {
      throw new InvalidStanceAxisError(value);
    }
    return new StanceAxis(Math.round(value * 1000) / 1000);
  }

  static neutral(): StanceAxis {
    return new StanceAxis(0);
  }

  equals(other: StanceAxis): boolean {
    return this.value === other.value;
  }

  distanceTo(other: StanceAxis): number {
    return Math.abs(this.value - other.value);
  }
}
