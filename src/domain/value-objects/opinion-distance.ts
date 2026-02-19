import { InvalidOpinionDistanceError } from "../errors/domain-errors";

const SWEET_SPOT_MIN = 0.4;
const SWEET_SPOT_MAX = 0.7;

export class OpinionDistance {
  readonly value: number;

  private constructor(value: number) {
    this.value = Math.round(value * 1000) / 1000;
  }

  static create(value: number): OpinionDistance {
    if (value < 0 || value > 2) {
      throw new InvalidOpinionDistanceError(value);
    }
    return new OpinionDistance(value);
  }

  isInSweetSpot(): boolean {
    return this.value >= SWEET_SPOT_MIN && this.value <= SWEET_SPOT_MAX;
  }

  isTooClose(): boolean {
    return this.value < SWEET_SPOT_MIN;
  }

  isTooFar(): boolean {
    return this.value > SWEET_SPOT_MAX;
  }

  equals(other: OpinionDistance): boolean {
    return this.value === other.value;
  }
}
