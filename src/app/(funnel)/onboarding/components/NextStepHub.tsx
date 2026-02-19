"use client";

import Link from "next/link";
import type { NextStepResult } from "@/domain/value-objects/next-step-action";

interface NextStepHubProps {
  actions: NextStepResult;
}

export function NextStepHub({ actions }: NextStepHubProps) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href={actions.primary.href}
        className="block rounded-xl bg-blue-600 px-6 py-4 text-center text-lg font-bold text-white shadow-md transition-colors hover:bg-blue-700"
      >
        {actions.primary.label} →
      </Link>

      {actions.secondary.length > 0 && (
        <div className="flex gap-3">
          {actions.secondary.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-center transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <span className="block text-sm font-medium text-gray-900">
                {action.label}
              </span>
              {action.estimatedMinutes && (
                <span className="block text-xs text-gray-500">
                  약 {action.estimatedMinutes}분
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
