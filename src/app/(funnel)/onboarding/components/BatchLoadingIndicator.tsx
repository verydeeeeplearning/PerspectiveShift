"use client";

interface BatchLoadingIndicatorProps {
  batchIndex: number;
  totalAnswered: number;
  targetTotal: number;
  error?: string | null;
  onRetry?: () => void;
  onContinueWithFallback?: () => void;
}

export function BatchLoadingIndicator({
  batchIndex,
  totalAnswered,
  targetTotal,
  error = null,
  onRetry,
  onContinueWithFallback,
}: BatchLoadingIndicatorProps) {
  const progressPercent = Math.round((totalAnswered / targetTotal) * 100);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="rounded-full bg-red-50 p-3">
          <svg
            className="h-6 w-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <p className="text-center text-sm text-gray-700">
          질문 생성 중 오류가 발생했어요
        </p>
        <p className="text-center text-xs text-gray-500">{error}</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              다시 시도
            </button>
          )}
          {onContinueWithFallback && (
            <button
              type="button"
              onClick={onContinueWithFallback}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              기본 질문으로 계속하기
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="relative h-10 w-10">
        <svg
          className="h-10 w-10 animate-spin text-blue-500"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          다음 질문을 준비하고 있어요
        </p>
        <p className="mt-1 text-xs text-gray-500">
          배치 {batchIndex + 1} 생성 중...
        </p>
      </div>
      <div className="w-48">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{totalAnswered}문항 완료</span>
          <span>{targetTotal}문항</span>
        </div>
        <div
          className="mt-1 h-2 w-full rounded-full bg-gray-200"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="전체 진행률"
        >
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
