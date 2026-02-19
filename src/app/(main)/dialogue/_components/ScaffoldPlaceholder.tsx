"use client";

import { ScaffoldTemplate, type DialogueStep } from "@/domain/value-objects/scaffold-template";

interface ScaffoldPlaceholderProps {
  step: DialogueStep;
}

export function ScaffoldPlaceholder({ step }: ScaffoldPlaceholderProps) {
  const scaffold = ScaffoldTemplate.forStep(step);

  if (!scaffold.placeholder) return null;

  return (
    <p className="text-sm text-gray-400 italic">
      {scaffold.placeholder}
    </p>
  );
}
