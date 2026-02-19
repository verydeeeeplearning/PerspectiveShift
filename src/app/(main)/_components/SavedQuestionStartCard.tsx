"use client";

interface SavedQuestionStartCardProps {
  questionText: string;
  onStart: () => void;
}

export function SavedQuestionStartCard({ questionText, onStart }: SavedQuestionStartCardProps) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-left">
      <p className="text-xs font-medium text-indigo-400">지난번에 궁금했던 것</p>
      <p className="mt-1 text-sm font-medium text-gray-800 line-clamp-2">
        &ldquo;{questionText}&rdquo;
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-3 w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
      >
        이 질문으로 대화 시작
      </button>
    </div>
  );
}
