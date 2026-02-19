export type RecommendationType =
  | "precision_upsell"
  | "ai_practice"
  | "misperception"
  | "share_card";

export class ContextualRecommendation {
  constructor(
    public readonly type: RecommendationType,
    public readonly label: string,
    public readonly priority: number,
  ) {}
}
