import { PerspectivePassport } from "@/domain/entities/perspective-passport";

interface UpdatePassportInput {
  weeklyExploredCount: number;
  totalExploredCount: number;
  discoveredConcepts: string[];
  newConcept: string;
}

interface UpdatePassportResult {
  weeklyExploredCount: number;
  totalExploredCount: number;
  discoveredConcepts: readonly string[];
}

export class UpdatePerspectivePassportUseCase {
  execute(input: UpdatePassportInput): UpdatePassportResult {
    const passport = PerspectivePassport.create({
      weeklyExploredCount: input.weeklyExploredCount,
      totalExploredCount: input.totalExploredCount,
      discoveredConcepts: input.discoveredConcepts,
    }).addDiscovery(input.newConcept);

    return {
      weeklyExploredCount: passport.weeklyExploredCount,
      totalExploredCount: passport.totalExploredCount,
      discoveredConcepts: passport.discoveredConcepts,
    };
  }
}
