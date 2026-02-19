"use client";

interface CooldownScreenProps {
  reason: "FATIGUE" | "DAILY_LIMIT" | "USER_REQUEST";
  suggestedActivity: string;
}

const TITLES: Record<string, string> = {
  FATIGUE: "오늘은 충분히 대화했어요",
  DAILY_LIMIT: "오늘의 대화 횟수를 모두 사용했어요",
  USER_REQUEST: "잠시 쉬어가세요",
};

export function CooldownScreen({ reason, suggestedActivity }: CooldownScreenProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl bg-gradient-to-b from-blue-50 to-white p-8 text-center">
      <div className="mb-4 text-4xl">🌿</div>
      <h2 className="mb-2 text-xl font-semibold text-gray-800">
        {TITLES[reason]}
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        좋은 대화를 위해 충분한 휴식이 필요해요. 내일 다시 만나요!
      </p>
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">대신 이런 건 어때요?</p>
        <p className="mt-1 text-sm font-medium text-blue-600">{suggestedActivity}</p>
      </div>
    </div>
  );
}
