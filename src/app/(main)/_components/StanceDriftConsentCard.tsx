"use client";

interface StanceDriftConsentCardProps {
  onOptIn: () => void;
  onDecline: () => void;
}

export default function StanceDriftConsentCard({ onOptIn, onDecline }: StanceDriftConsentCardProps) {
  return (
    <div className="rounded-xl border p-6">
      <h3 className="font-semibold">입장 변화 알림</h3>
      <p className="mt-2 text-sm text-gray-600">
        대화를 거듭하면서 당신의 입장이 어떻게 변했는지 알려드릴 수 있어요.
      </p>
      <p className="mt-1 text-xs text-gray-400">
        ⚠️ 언제든 끄고 삭제할 수 있어요
      </p>
      <div className="mt-4 flex gap-3">
        <button onClick={onOptIn} className="flex-1 rounded bg-indigo-500 px-4 py-2 text-sm text-white">
          켜기
        </button>
        <button onClick={onDecline} className="flex-1 rounded border px-4 py-2 text-sm">
          지금은 안 할게요
        </button>
      </div>
    </div>
  );
}
