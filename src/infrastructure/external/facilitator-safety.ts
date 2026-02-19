export const BLOCKED_KEYWORDS = [
  "stance_vector",
  "stance_value",
  "demographic",
  "political_orientation",
  "reasoning_tags",
  "identity_data",
  "age_group",
  "gender_identity",
  "income_level",
  "education_level",
] as const;

export function validateFacilitatorInput(input: string): void {
  const lowerInput = input.toLowerCase();
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerInput.includes(keyword)) {
      throw new Error(
        `Facilitator input must not contain "${keyword}". ` +
        `Stance and demographic data must never be passed to the facilitator.`,
      );
    }
  }
}
