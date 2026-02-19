import type { StanceVector } from "../entities/stance-vector";
import type { ConversationTrailer } from "../value-objects/conversation-trailer";

export interface TrailerGenerator {
  generate(
    opponentStance: StanceVector,
    myStance: StanceVector,
    topic: string,
  ): Promise<ConversationTrailer>;
}
