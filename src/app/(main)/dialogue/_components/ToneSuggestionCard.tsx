"use client";

interface ToneSuggestionCardProps {
  originalText: string;
  suggestedText: string;
  onUseSuggestion: () => void;
  onSendOriginal: () => void;
}

export function ToneSuggestionCard({
  originalText,
  suggestedText,
  onUseSuggestion,
  onSendOriginal,
}: ToneSuggestionCardProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="mb-3 text-sm font-medium text-amber-800">
        잠깐, 한 가지 제안이 있어요
      </p>

      <div className="mb-3 space-y-2">
        <div className="rounded-lg bg-white p-3">
          <p className="mb-1 text-xs text-gray-400">현재 문장</p>
          <p className="text-sm text-gray-700">{originalText}</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="mb-1 text-xs text-blue-500">대안 문장</p>
          <p className="text-sm text-blue-800">{suggestedText}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onUseSuggestion}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          이 표현 사용하기
        </button>
        <button
          type="button"
          onClick={onSendOriginal}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
        >
          원래대로 보내기
        </button>
      </div>
    </div>
  );
}
