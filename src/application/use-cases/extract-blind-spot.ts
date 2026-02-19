import { BlindSpotDiscovery } from "@/domain/value-objects/blind-spot-discovery";

interface ExtractBlindSpotInput {
  discoveredConcept: string;
  dialogueId: string;
}

interface ExtractBlindSpotResult {
  discoveredConcept: string;
  dialogueId: string;
}

export class ExtractBlindSpotUseCase {
  execute(input: ExtractBlindSpotInput): ExtractBlindSpotResult {
    const bs = BlindSpotDiscovery.create({
      discoveredConcept: input.discoveredConcept,
      dialogueId: input.dialogueId,
    });
    return {
      discoveredConcept: bs.discoveredConcept,
      dialogueId: bs.dialogueId,
    };
  }
}
