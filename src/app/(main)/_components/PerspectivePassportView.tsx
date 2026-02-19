"use client";

interface PerspectivePassportViewProps {
  weeklyExploredCount: number;
  totalExploredCount: number;
  discoveredConcepts: readonly string[];
}

export default function PerspectivePassportView({
  weeklyExploredCount,
  totalExploredCount,
  discoveredConcepts,
}: PerspectivePassportViewProps) {
  return (
    <div className="rounded-xl border p-5">
      <h3 className="font-semibold">🗺️ Perspective Passport</h3>
      <div className="mt-3 flex gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{weeklyExploredCount}</p>
          <p className="text-xs text-gray-400">이번 주</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{totalExploredCount}</p>
          <p className="text-xs text-gray-400">누적</p>
        </div>
      </div>
      {discoveredConcepts.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500">새로 발견한 개념</p>
          <ul className="mt-1 space-y-1">
            {discoveredConcepts.map((c, i) => (
              <li key={i} className="rounded bg-blue-50 px-2 py-1 text-xs">
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
