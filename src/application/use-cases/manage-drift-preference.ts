import { StanceDriftPreference } from "@/domain/value-objects/stance-drift-preference";

interface ManageDriftPreferenceInput {
  optIn: boolean;
}

interface ManageDriftPreferenceResult {
  optedIn: boolean;
}

export class ManageDriftPreferenceUseCase {
  execute(input: ManageDriftPreferenceInput): ManageDriftPreferenceResult {
    const p = StanceDriftPreference.create(input.optIn);
    return { optedIn: p.optedIn };
  }
}
