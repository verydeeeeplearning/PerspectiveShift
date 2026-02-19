"use client";

interface DailyLimitNoticeProps {
  remaining: number;
  maxDaily: number;
}

export function DailyLimitNotice({ remaining, maxDaily }: DailyLimitNoticeProps) {
  if (remaining >= maxDaily) return null;

  return (
    <div
      className={`rounded-lg px-4 py-2 text-sm ${
        remaining === 0
          ? "bg-red-50 text-red-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {remaining > 0 ? (
        <p>오늘 남은 대화 횟수: <span className="font-bold">{remaining}회</span></p>
      ) : (
        <p>오늘의 대화 횟수를 모두 사용했어요. 내일 다시 만나요!</p>
      )}
    </div>
  );
}
