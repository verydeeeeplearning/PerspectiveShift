"use client";

interface DiscoveryCardListProps {
  concepts: readonly string[];
}

export function DiscoveryCardList({ concepts }: DiscoveryCardListProps) {
  if (concepts.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-8">
        아직 발견한 개념이 없어요. 대화를 시작해보세요!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {concepts.map((concept, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3"
        >
          <span className="mt-0.5 text-lg">💡</span>
          <p className="text-sm text-gray-700">{concept}</p>
        </div>
      ))}
    </div>
  );
}
