"use client";

interface DetectedExpression {
  expression: string;
  suggestedText: string;
}

interface ReceptivenessNudgeProps {
  detected: DetectedExpression;
  onInclude: (text: string) => void;
  onDismiss: () => void;
}

export function ReceptivenessNudge({ detected, onInclude, onDismiss }: ReceptivenessNudgeProps) {
  return (
    <div className="rounded-lg border border-green-100 bg-green-50/50 px-4 py-3">
      <p className="text-xs font-medium text-green-600">
        상대방이 다른 관점도 고려하고 있어요
      </p>
      <p className="mt-1 text-sm text-gray-700 italic">
        &ldquo;{detected.expression}&rdquo;
      </p>
      <p className="mt-2 text-xs text-gray-500">
        이런 응답은 어떨까요?
      </p>
      <p className="mt-1 text-sm text-gray-800">
        &ldquo;{detected.suggestedText}&rdquo;
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onInclude(detected.suggestedText)}
          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
        >
          이 표현을 내 답장에 포함
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50"
        >
          괜찮아요
        </button>
      </div>
    </div>
  );
}
