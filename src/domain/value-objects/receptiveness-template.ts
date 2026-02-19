export type ReceptivenessCategory = "CLARIFICATION" | "ACKNOWLEDGMENT" | "ELABORATION";

export interface ReceptivenessTemplateData {
  id: string;
  text: string;
  category: ReceptivenessCategory;
}

const TEMPLATES: ReceptivenessTemplateData[] = [
  { id: "clarify-1", text: "제가 이해한 게 맞나요? ____ 라는 건가요?", category: "CLARIFICATION" },
  { id: "clarify-2", text: "혹시 ____ 라는 의미인가요?", category: "CLARIFICATION" },
  { id: "ack-1", text: "그 부분은 공감이 돼요. 특히 ____?", category: "ACKNOWLEDGMENT" },
  { id: "ack-2", text: "그런 경험이 있으셨군요. 어떤 점이 가장 ____?", category: "ACKNOWLEDGMENT" },
  { id: "elab-1", text: "그 부분이 흥미로운데, 좀 더 설명해주실 수 있나요?", category: "ELABORATION" },
  { id: "elab-2", text: "구체적인 예를 들어주실 수 있나요?", category: "ELABORATION" },
];

export class ReceptivenessTemplate {
  static all(): ReceptivenessTemplateData[] {
    return [...TEMPLATES];
  }

  static findById(id: string): ReceptivenessTemplateData | null {
    return TEMPLATES.find((t) => t.id === id) ?? null;
  }
}
