"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-gray-300">!</h1>
        <h2 className="text-xl font-semibold">문제가 발생했습니다</h2>
        <p className="text-gray-600">
          {error.message || "예상치 못한 오류가 발생했습니다."}
        </p>
        <button
          onClick={reset}
          className="inline-block mt-4 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
