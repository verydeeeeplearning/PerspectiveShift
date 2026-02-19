import {
  ReceptivenessTemplate,
  type ReceptivenessCategory,
} from "@/domain/value-objects/receptiveness-template";

export interface TemplateItem {
  id: string;
  text: string;
  category: ReceptivenessCategory;
}

export interface ReceptivenessTemplateResult {
  templates: TemplateItem[];
}

export class SuggestReceptivenessTemplateUseCase {
  execute(): ReceptivenessTemplateResult {
    const templates = ReceptivenessTemplate.all().map((t) => ({
      id: t.id,
      text: t.text,
      category: t.category,
    }));
    return { templates };
  }
}
