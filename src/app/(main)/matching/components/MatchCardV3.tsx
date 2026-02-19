"use client";

interface DistanceLabelInfo {
  level: string;
  emoji: string;
  shortText: string;
  description: string;
  isDisabled: boolean;
}

interface MatchCardV3Props {
  topic: string;
  distanceLabel: DistanceLabelInfo;
  estimatedMinutes: number;
  socialProof?: string;
  trailer?: string;
  onStart: () => void;
  onDecline: () => void;
}

export function MatchCardV3({
  topic,
  distanceLabel,
  estimatedMinutes,
  socialProof,
  trailer,
  onStart,
  onDecline,
}: MatchCardV3Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          TODAY&apos;S MATCH
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
          🔒 익명
        </span>
      </div>

      <h3 className="mb-3 text-xl font-bold text-gray-900">{topic}</h3>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{distanceLabel.emoji}</span>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {distanceLabel.shortText}
            </p>
            <p className="text-xs text-gray-500">
              {distanceLabel.description}
            </p>
          </div>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm font-medium text-gray-900">
            약 {estimatedMinutes}분
          </p>
        </div>
      </div>

      {trailer && (
        <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3">
          <p className="text-sm leading-relaxed text-blue-800">
            {trailer}
          </p>
        </div>
      )}

      {socialProof && (
        <p className="mb-4 text-center text-xs text-gray-400">
          {socialProof}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onStart}
          aria-label="대화 시작하기"
          className="flex-1 rounded-xl bg-blue-600 px-6 py-3 text-center font-bold text-white transition-colors hover:bg-blue-700"
        >
          대화 시작하기 →
        </button>
        <button
          type="button"
          onClick={onDecline}
          aria-label="다음에"
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-50"
        >
          다음에
        </button>
      </div>
    </div>
  );
}
