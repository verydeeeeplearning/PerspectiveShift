"use client";

interface JointSummaryCardViewProps {
  agreedPoints: readonly string[];
  disagreedPoints: readonly string[];
  sharedQuestion: string | null;
}

export default function JointSummaryCardView({
  agreedPoints,
  disagreedPoints,
  sharedQuestion,
}: JointSummaryCardViewProps) {
  return (
    <div className="space-y-4 rounded-xl border p-4">
      {agreedPoints.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold">✅ 우리가 동의한 것</h3>
          <ul className="space-y-1">
            {agreedPoints.map((p, i) => (
              <li key={i} className="rounded bg-green-50 px-3 py-1 text-sm">
                {p}
              </li>
            ))}
          </ul>
        </section>
      )}
      {disagreedPoints.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold">💬 우리가 다르게 본 것</h3>
          <ul className="space-y-1">
            {disagreedPoints.map((p, i) => (
              <li key={i} className="rounded bg-orange-50 px-3 py-1 text-sm">
                {p}
              </li>
            ))}
          </ul>
        </section>
      )}
      {sharedQuestion && (
        <section>
          <h3 className="mb-2 font-semibold">❓ 함께 더 알고 싶은 질문</h3>
          <p className="rounded bg-blue-50 px-3 py-2 text-sm">{sharedQuestion}</p>
        </section>
      )}
    </div>
  );
}
