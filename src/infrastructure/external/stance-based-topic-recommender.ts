import type { TopicRecommender } from "@/domain/interfaces/topic-recommender";
import type { TopicRepository } from "@/domain/interfaces/topic-repository";
import type { ControversialTopic } from "@/domain/value-objects/controversial-topic";
import type { StanceVector } from "@/domain/entities/stance-vector";
import { ALL_DIMENSIONS } from "@/domain/value-objects/stance-dimension";

export class StanceBasedTopicRecommender implements TopicRecommender {
  constructor(private readonly topicRepository: TopicRepository) {}

  async recommend(
    stanceVector: StanceVector,
    recentTopicIds: string[] = [],
  ): Promise<ControversialTopic> {
    const recentSet = new Set(recentTopicIds);

    // 1. Find the dimension with the strongest opinion (highest absolute value)
    const dimensionsByStrength = [...ALL_DIMENSIONS].sort((a, b) => {
      return (
        Math.abs(stanceVector.get(b).value) -
        Math.abs(stanceVector.get(a).value)
      );
    });

    // 2. Try each dimension in order of strength
    for (const dimension of dimensionsByStrength) {
      const topics = await this.topicRepository.findByDimension(dimension);
      const available = topics.filter((t) => !recentSet.has(t.id));
      if (available.length > 0) {
        return available[Math.floor(Math.random() * available.length)];
      }
    }

    // 3. Fallback: pick from entire pool excluding recent
    const all = await this.topicRepository.findAll();
    const fallback = all.filter((t) => !recentSet.has(t.id));
    if (fallback.length > 0) {
      return fallback[Math.floor(Math.random() * fallback.length)];
    }

    // 4. If all topics exhausted, return any topic
    return all[Math.floor(Math.random() * all.length)];
  }
}
