"use client";

interface ReceptivenessDashboardProps {
  totalPoints: number;
  templateAdoptions: number;
  feelHeardReceived: number;
  percentile: number | null;
}

export function ReceptivenessDashboard({
  totalPoints,
  templateAdoptions,
  feelHeardReceived,
  percentile,
}: ReceptivenessDashboardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">수용성 대시보드</h3>

      {percentile !== null && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-center">
          <p className="text-sm text-green-800">
            당신의 대화 수용성이 상위 {percentile}%입니다
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
          <div className="text-xs text-gray-500">누적 점수</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{templateAdoptions}</div>
          <div className="text-xs text-gray-500">템플릿 채택</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">{feelHeardReceived}</div>
          <div className="text-xs text-gray-500">이해받음 고득점</div>
        </div>
      </div>
    </div>
  );
}
