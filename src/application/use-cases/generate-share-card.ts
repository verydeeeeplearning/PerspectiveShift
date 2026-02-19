import { ShareCard, type MisperceptionData, type AliasInfo } from "@/domain/entities/share-card";
import type { ShareCardType } from "@/domain/value-objects/share-card-type";
import { isValidShareCardType } from "@/domain/value-objects/share-card-type";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";
import { DomainError } from "@/domain/errors/domain-errors";

export interface GenerateShareCardInput {
  type: ShareCardType;
  vector: Record<StanceDimension, number>;
  alias?: AliasInfo;
  selectedAxes?: StanceDimension[];
  misperception?: {
    dimension: StanceDimension;
    userPrediction: number;
    actualBaseline: number;
    baselineLabel: string;
  };
}

export interface ShareCardOutput {
  type: ShareCardType;
  privacyDisclaimer: string;
  alias?: AliasInfo;
  topDimensions?: StanceDimension[];
  selectedAxes?: StanceDimension[];
  vectorSubset?: Partial<Record<StanceDimension, number>>;
  misperception?: MisperceptionData;
}

export class GenerateShareCardUseCase {
  execute(input: GenerateShareCardInput): ShareCardOutput {
    if (!isValidShareCardType(input.type)) {
      throw new DomainError(`Invalid share card type: ${input.type}`);
    }

    const card = this.createCard(input);

    return {
      type: card.type,
      privacyDisclaimer: card.privacyDisclaimer,
      alias: card.alias,
      topDimensions: card.topDimensions,
      selectedAxes: card.selectedAxes,
      vectorSubset: card.vectorSubset,
      misperception: card.misperception,
    };
  }

  private createCard(input: GenerateShareCardInput): ShareCard {
    switch (input.type) {
      case "ALIAS": {
        const topDimensions = this.getTopDimensions(input.vector, 2);
        return ShareCard.alias({
          alias: input.alias!,
          topDimensions,
        });
      }
      case "THOUGHT_MAP":
        return ShareCard.thoughtMap({
          vector: input.vector,
          selectedAxes: input.selectedAxes,
        });
      case "MISPERCEPTION":
        return ShareCard.misperception(input.misperception!);
    }
  }

  private getTopDimensions(
    vector: Record<StanceDimension, number>,
    count: number,
  ): StanceDimension[] {
    return (Object.entries(vector) as [StanceDimension, number][])
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, count)
      .map(([dim]) => dim);
  }
}
