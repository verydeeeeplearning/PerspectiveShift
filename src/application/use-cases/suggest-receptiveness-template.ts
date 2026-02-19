import {
  ReceptivenessTemplate,
  type ReceptivenessCategory,
  type ReceptivenessSourceType,
} from "@/domain/value-objects/receptiveness-template";
import type { Facilitator } from "@/domain/interfaces/facilitator";

export interface TemplateItem {
  id: string;
  text: string;
  category: ReceptivenessCategory;
  sourceType: ReceptivenessSourceType;
  detectedExpression?: string;
}

export interface ReceptivenessTemplateResult {
  templates: TemplateItem[];
  hasDetected: boolean;
}

export interface SuggestReceptivenessTemplateDeps {
  facilitator: Facilitator;
}

export class SuggestReceptivenessTemplateUseCase {
  constructor(private readonly deps: SuggestReceptivenessTemplateDeps) {}

  async execute(opponentText?: string): Promise<ReceptivenessTemplateResult> {
    const mechanical: TemplateItem[] = ReceptivenessTemplate.all().map((t) => ({
      id: t.id,
      text: t.text,
      category: t.category,
      sourceType: t.sourceType,
    }));

    if (!opponentText) {
      return { templates: mechanical, hasDetected: false };
    }

    const detected = await this.deps.facilitator.detectReceptiveExpressions(opponentText);

    const detectedItems: TemplateItem[] = detected.map((d) => {
      const tmpl = ReceptivenessTemplate.fromDetected(d.expression, d.suggestedResponse);
      return {
        id: tmpl.id,
        text: tmpl.text,
        category: tmpl.category,
        sourceType: tmpl.sourceType,
        detectedExpression: tmpl.detectedExpression,
      };
    });

    return {
      templates: [...detectedItems, ...mechanical],
      hasDetected: detectedItems.length > 0,
    };
  }
}
