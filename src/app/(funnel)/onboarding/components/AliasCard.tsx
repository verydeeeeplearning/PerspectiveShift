"use client";

import type { AliasOutput } from "@/application/dtos/thought-map-output";

interface AliasCardProps {
  alias: AliasOutput;
}

export function AliasCard({ alias }: AliasCardProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center">
      <span className="text-4xl" role="img" aria-label={alias.label}>
        {alias.emoji}
      </span>
      <h3 className="mt-3 text-xl font-bold text-gray-900">
        {alias.label}
      </h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">
        {alias.description}
      </p>
    </div>
  );
}
