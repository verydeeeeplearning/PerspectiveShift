export interface CheckMatchingPoolInput {
  userId: string;
  candidateCount: number;
}

export interface CheckMatchingPoolOutput {
  hasHumanMatch: boolean;
}

export class CheckMatchingPoolUseCase {
  execute(input: CheckMatchingPoolInput): CheckMatchingPoolOutput {
    return {
      hasHumanMatch: input.candidateCount > 0,
    };
  }
}
