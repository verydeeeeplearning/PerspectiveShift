import type { CoreValue } from "./core-value";

export class SelfAffirmation {
  readonly coreValue: CoreValue;
  readonly experience: string | null;

  private constructor(coreValue: CoreValue, experience: string | null) {
    this.coreValue = coreValue;
    this.experience = experience;
  }

  static create(coreValue: CoreValue, experience?: string): SelfAffirmation {
    const trimmed = experience?.trim() || null;
    return new SelfAffirmation(coreValue, trimmed || null);
  }

  equals(other: SelfAffirmation): boolean {
    return (
      this.coreValue.equals(other.coreValue) &&
      this.experience === other.experience
    );
  }
}
