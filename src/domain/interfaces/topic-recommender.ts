import type { ControversialTopic } from "../value-objects/controversial-topic";
import type { StanceVector } from "../entities/stance-vector";

export interface TopicRecommender {
  recommend(
    stanceVector: StanceVector,
    recentTopicIds?: string[],
  ): Promise<ControversialTopic>;
}
