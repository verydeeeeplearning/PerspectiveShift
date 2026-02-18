"use client";

import type { SummaryCardOutput } from "@/application/dtos/feedback-output";

interface SummaryCardViewProps {
  summary: SummaryCardOutput;
}

export function SummaryCardView({ summary }: SummaryCardViewProps) {
  return (
    <div className="space-y-6">
      <section className="bg-white border rounded-lg p-5">
        <h2 className="font-bold text-lg mb-3">핵심 주장</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-blue-600 mb-2">
              참여자 A
            </h3>
            <ul className="space-y-1">
              {summary.keyArguments.participantA.map((arg, i) => (
                <li key={i} className="text-sm text-gray-700">
                  &bull; {arg}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-green-600 mb-2">
              참여자 B
            </h3>
            <ul className="space-y-1">
              {summary.keyArguments.participantB.map((arg, i) => (
                <li key={i} className="text-sm text-gray-700">
                  &bull; {arg}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-green-50 border border-green-200 rounded-lg p-5">
        <h2 className="font-bold text-lg mb-3">공통점</h2>
        <ul className="space-y-1">
          {summary.commonGround.map((item, i) => (
            <li key={i} className="text-sm text-gray-700">
              &bull; {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
        <h2 className="font-bold text-lg mb-3">미해결 질문</h2>
        <ul className="space-y-1">
          {summary.unresolvedQuestions.map((q, i) => (
            <li key={i} className="text-sm text-gray-700">
              ? {q}
            </li>
          ))}
        </ul>
      </section>

      {summary.blindSpots.length > 0 && (
        <section className="bg-purple-50 border border-purple-200 rounded-lg p-5">
          <h2 className="font-bold text-lg mb-3">맹점</h2>
          <ul className="space-y-1">
            {summary.blindSpots.map((b, i) => (
              <li key={i} className="text-sm text-gray-700">
                &bull; {b}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
