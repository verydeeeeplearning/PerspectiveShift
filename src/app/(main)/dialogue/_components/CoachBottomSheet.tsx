"use client";

import { CoachSuggestion } from "@/domain/value-objects/coach-suggestion";

interface CoachBottomSheetProps {
  open: boolean;
  onSelect: (template: string) => void;
  onClose: () => void;
}

export function CoachBottomSheet({ open, onSelect, onClose }: CoachBottomSheetProps) {
  if (!open) return null;

  const suggestions = CoachSuggestion.all();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="코치 도우미"
    >
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <h3 className="mb-4 text-center text-lg font-bold text-gray-900">
          어떻게 시작할까요?
        </h3>

        <div className="flex flex-col gap-2">
          {suggestions.map((s) => (
            <button
              key={s.method}
              type="button"
              onClick={() => onSelect(s.template)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <p className="text-sm font-medium text-gray-900">{s.label}</p>
              <p className="mt-1 text-xs text-gray-500">{s.template}</p>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full py-2 text-center text-sm text-gray-400 hover:text-gray-600"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
