"use client";

import type { MapTypeOutput } from "@/application/dtos/thought-map-output";

interface TypeAliasProps {
  mapType: MapTypeOutput;
}

export function TypeAlias({ mapType }: TypeAliasProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center">
      <span className="text-4xl" role="img" aria-label={mapType.alias}>
        {mapType.emoji}
      </span>
      <h2 className="mt-3 text-2xl font-bold text-gray-900">
        {mapType.alias}
      </h2>
      <p className="mt-2 text-gray-600 leading-relaxed">
        {mapType.description}
      </p>
    </div>
  );
}
