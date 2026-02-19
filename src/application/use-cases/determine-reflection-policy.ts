import { RoleplaySteelman } from "@/domain/value-objects/roleplay-steelman";

interface PolicyInput {
  dialogueCount: number;
  understandingScore: number;
}

interface PolicyResult {
  isQuizRequired: boolean;
  isVerificationRequired: boolean;
  isSteelmanForced: boolean;
  isCommonGroundRequired: boolean;
}

export class DetermineReflectionPolicyUseCase {
  execute(input: PolicyInput): PolicyResult {
    return {
      isQuizRequired: true,
      isVerificationRequired: true,
      isSteelmanForced: RoleplaySteelman.isForceRequired(
        input.dialogueCount,
        input.understandingScore,
      ),
      isCommonGroundRequired: false,
    };
  }
}
