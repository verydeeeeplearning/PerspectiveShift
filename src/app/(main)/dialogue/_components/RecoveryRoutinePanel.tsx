"use client";

interface RecoveryRoutinePanelProps {
  messages: readonly string[];
  onLater: () => void;
  onFindNew: () => void;
}

export default function RecoveryRoutinePanel({
  messages,
  onLater,
  onFindNew,
}: RecoveryRoutinePanelProps) {
  return (
    <div className="space-y-4 rounded-xl bg-gray-50 p-6">
      {messages.map((msg, i) => (
        <p key={i} className="text-sm text-gray-700">
          {msg}
        </p>
      ))}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onLater}
          className="flex-1 rounded border px-4 py-2 text-sm"
        >
          나중에 다시 보기
        </button>
        <button
          onClick={onFindNew}
          className="flex-1 rounded border px-4 py-2 text-sm"
        >
          바로 찾아봐요
        </button>
      </div>
    </div>
  );
}
