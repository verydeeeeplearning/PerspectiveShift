import type { ControversialTopic } from "../value-objects/controversial-topic";
import type { StanceDimension } from "../value-objects/stance-dimension";

export interface TopicRepository {
  findAll(): Promise<ControversialTopic[]>;
  findById(id: string): Promise<ControversialTopic | null>;
  findByDimension(dimension: StanceDimension): Promise<ControversialTopic[]>;
}
