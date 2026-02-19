"use client";

interface HighlightPopupProps {
  open: boolean;
  highlightedText: string;
  onHighlight: (autoQuote: string) => void;
  onClose: () => void;
}

export function HighlightPopup({
  open,
  highlightedText,
  onHighlight,
  onClose,
}: HighlightPopupProps) {
  if (!open) return null;

  const trimmed = highlightedText.trim();
  const autoQuote = `"${trimmed}"라고 하셨는데, `;

  return (
    <div className="absolute z-40 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-xs text-gray-500 truncate max-w-[200px]">
        &ldquo;{trimmed}&rdquo;
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onHighlight(autoQuote)}
          className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
        >
          밑줄 + 인용
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="rounded-md px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600"
        >
          취소
        </button>
      </div>
    </div>
  );
}
