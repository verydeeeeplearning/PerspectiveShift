import { CommonGroundDiscovery } from "@/domain/value-objects/common-ground-discovery";

interface SaveCommonGroundInput {
  mostConvincingPoint?: string | null;
  nextQuestion?: string | null;
}

interface SaveCommonGroundResult {
  mostConvincingPoint: string | null;
  nextQuestion: string | null;
  isEmpty: boolean;
}

export class SaveCommonGroundUseCase {
  execute(input: SaveCommonGroundInput): SaveCommonGroundResult {
    const cg = CommonGroundDiscovery.create(input);
    return {
      mostConvincingPoint: cg.mostConvincingPoint,
      nextQuestion: cg.nextQuestion,
      isEmpty: cg.isEmpty,
    };
  }
}
