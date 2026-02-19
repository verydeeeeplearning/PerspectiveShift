"use client";

import type { JointSummaryOutput } from "@/application/dtos/joint-summary-output";

interface JointSummaryCardProps {
  summary: JointSummaryOutput;
}

export function JointSummaryCard({ summary }: JointSummaryCardProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">공동 요약</h3>

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
