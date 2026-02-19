"use client";

interface BlindSpotCardProps {
  discoveredConcept: string;
  onExploreMore?: () => void;
  onSave?: () => void;
}

export default function BlindSpotCard({
  discoveredConcept,
  onExploreMore,
  onSave,
}: BlindSpotCardProps) {
  return (
    <div className="rounded-xl bg-yellow-50 p-5">
      <div className="flex items-center gap-2">
        <span className="text-2xl" role="img" aria-label="발견">
          🔍
        </span>
        <h3 className="font-semibold">오늘의 발견</h3>
      </div>
      <p className="mt-3 text-sm">{discoveredConcept}</p>
      <div className="mt-4 flex gap-2">
        {onExploreMore && (
          <button
            onClick={onExploreMore}
            className="rounded bg-yellow-200 px-3 py-1 text-sm"
          >
            이 주제 더 탐색하기
          </button>
        )}
        {onSave && (
          <button
            onClick={onSave}
            className="rounded bg-gray-200 px-3 py-1 text-sm"
          >
            저장
          </button>
        )}
      </div>
    </div>
  );
}
