import { OpinionDistanceLabel } from "@/domain/value-objects/opinion-distance-label";
import { ConversationTrailer } from "@/domain/value-objects/conversation-trailer";

export interface BuildMatchCardInput {
  distance: number;
  topic: string;
  estimatedMinutes: number;
  trailerText?: string;
}

export interface MatchCardResult {
  topic: string;
  estimatedMinutes: number;
  distanceLabel: {
    level: string;
    emoji: string;
    shortText: string;
    description: string;
    isDisabled: boolean;
  };
  trailer?: string;
}

export class BuildMatchCardUseCase {
  execute(input: BuildMatchCardInput): MatchCardResult {
    const label = OpinionDistanceLabel.fromDistance(input.distance);

    let trailer: string | undefined;
    if (input.trailerText) {
      const validated = ConversationTrailer.create(input.trailerText);
      trailer = validated.text;
    }

    return {
      topic: input.topic,
      estimatedMinutes: input.estimatedMinutes,
      distanceLabel: {
        level: label.level,
        emoji: label.emoji,
        shortText: label.shortText,
        description: label.description,
        isDisabled: label.isDisabled,
      },
      trailer,
    };
  }
}
