"use client";

import type { JointSummaryOutput } from "@/application/dtos/joint-summary-output";

interface JointSummaryCardProps {
  summary: JointSummaryOutput;
}

export function JointSummaryCard({ summary }: JointSummaryCardProps) {
  const hasEnhancedFields =
    summary.topic || summary.myKeyPoint || summary.opponentKeyPoint;

  return (
    <div className="space-y-4">
      {/* Header: title, topic, date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">공동 요약</h3>
          {summary.topic && (
            <span className="text-sm text-gray-600">
              | 주제: {summary.topic}
            </span>
          )}
        </div>
        {summary.date && (
          <span className="text-sm text-gray-500">{summary.date}</span>
        )}
      </div>

      {/* Enhanced key points section */}
      {hasEnhancedFields && (
        <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
          {summary.myKeyPoint && (
            <div className="text-sm text-gray-700">
              <span className="font-medium">나의 핵심 주장:</span>{" "}
              &ldquo;{summary.myKeyPoint}&rdquo;
            </div>
          )}
          {summary.opponentKeyPoint && (
            <div className="text-sm text-gray-700">
              <span className="font-medium">상대의 핵심 주장:</span>{" "}
              &ldquo;{summary.opponentKeyPoint}&rdquo;
            </div>
          )}
          {summary.commonGround != null && (
            <div className="text-sm text-gray-700">
              <span className="font-medium">공통점:</span>{" "}
              &ldquo;{summary.commonGround}&rdquo;
            </div>
          )}
          {summary.newDiscovery != null && (
            <div className="text-sm text-gray-700">
              <span className="font-medium">새로운 발견:</span>{" "}
              &ldquo;{summary.newDiscovery}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* Scores section */}
      {hasEnhancedFields &&
        (summary.understandingScore != null ||
          summary.feelHeardScore != null) && (
          <div className="flex items-center gap-6 text-sm text-gray-700">
            {summary.understandingScore != null && (
              <span>
                Understanding Score: {summary.understandingScore}
              </span>
            )}
            {summary.feelHeardScore != null && summary.feelHeardScore > 0 && (
              <span>Feel Heard: {summary.feelHeardScore}/5</span>
            )}
          </div>
        )}

      {/* Original sections */}
      <Section
        title="동의한 부분"
        items={summary.agreedPoints}
        emptyText="아직 동의 사항이 없습니다"
        bgColor="bg-green-50"
        borderColor="border-green-200"
      />

      <Section
        title="의견이 다른 부분"
        items={summary.disagreedPoints}
        emptyText="명시된 비동의 사항이 없습니다"
        bgColor="bg-red-50"
        borderColor="border-red-200"
      />

      <Section
        title="함께 궁금한 질문"
        items={summary.sharedQuestions}
        emptyText="아직 공유된 질문이 없습니다"
        bgColor="bg-blue-50"
        borderColor="border-blue-200"
      />

      {summary.llmGenerated && (
        <p className="text-xs text-gray-400 text-center">
          AI가 대화 내용을 기반으로 생성한 요약입니다
        </p>
      )}

      {/* Auto-saved indicator and share button */}
      {hasEnhancedFields && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
          {summary.autoSaved && (
            <span className="text-xs text-gray-500">자동 저장됨</span>
          )}
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            aria-label="공유하기"
          >
            공유하기
          </button>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  items,
  emptyText,
  bgColor,
  borderColor,
}: {
  title: string;
  items: string[];
  emptyText: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-4`}>
      <h4 className="font-medium text-gray-900">{title}</h4>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-gray-700">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-gray-400">{emptyText}</p>
      )}
    </div>
  );
}
