"use client";

import {
  ReceptivenessTemplate,
  type ReceptivenessCategory,
} from "@/domain/value-objects/receptiveness-template";

interface ReceptivenessTemplateListProps {
  onSelect: (text: string) => void;
}

const CATEGORY_LABELS: Record<ReceptivenessCategory, string> = {
  CLARIFICATION: "확인",
  ACKNOWLEDGMENT: "공감",
  ELABORATION: "탐색",
};

export function ReceptivenessTemplateList({ onSelect }: ReceptivenessTemplateListProps) {
  const templates = ReceptivenessTemplate.all();
  const categories: ReceptivenessCategory[] = ["CLARIFICATION", "ACKNOWLEDGMENT", "ELABORATION"];

  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const items = templates.filter((t) => t.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat}>
            <p className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {CATEGORY_LABELS[cat]}
            </p>
            <div className="flex flex-col gap-1">
              {items.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelect(t.text)}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  {t.text}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
