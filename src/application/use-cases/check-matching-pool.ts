export interface CheckMatchingPoolInput {
  userId: string;
  candidateCount: number;
}

export interface CheckMatchingPoolOutput {
  hasHumanMatch: boolean;
  suggestPersona: boolean;
}

export class CheckMatchingPoolUseCase {
  execute(input: CheckMatchingPoolInput): CheckMatchingPoolOutput {
    const hasHumanMatch = input.candidateCount > 0;
    return {
      hasHumanMatch,
      suggestPersona: !hasHumanMatch,
    };
  }
}
