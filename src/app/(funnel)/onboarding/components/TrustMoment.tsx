"use client";

import { useCallback, useEffect, useState } from "react";

export type TrustMomentEventName =
  | "trust_moment_view"
  | "trust_moment_detail_expand"
  | "trust_moment_data_mgmt_click"
  | "trust_moment_proceed";

interface TrustMomentProps {
  onProceed: () => void;
  onEvent?: (eventName: TrustMomentEventName) => void;
}

function createTimestampPayload() {
  return { timestamp: Date.now() };
}

export function TrustMoment({ onProceed, onEvent }: TrustMomentProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDataPanelOpen, setIsDataPanelOpen] = useState(false);

  const emitEvent = useCallback(
    (eventName: TrustMomentEventName) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("perspectiveshift:analytics", {
            detail: { type: eventName, payload: createTimestampPayload() },
          }),
        );
      }
      onEvent?.(eventName);
    },
    [onEvent],
  );

  useEffect(() => {
    emitEvent("trust_moment_view");
  }, [emitEvent]);

  const handleToggleDetail = () => {
    setIsDetailOpen((prev) => {
      const next = !prev;
      if (next) {
        emitEvent("trust_moment_detail_expand");
      }
      return next;
    });
  };

  const handleDataManagementClick = () => {
    emitEvent("trust_moment_data_mgmt_click");
    setIsDataPanelOpen((prev) => !prev);
  };

  const handleProceed = () => {
    emitEvent("trust_moment_proceed");
    onProceed();
  };

  return (
    <section
      className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      aria-label="신뢰 안내"
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <span aria-hidden>🔒</span>
            <span>당신의 생각은 안전합니다</span>
          </h2>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>✓ 닉네임만 사용, 실명 비공개</li>
            <li>✓ 답변 원문은 분석 후 즉시 삭제</li>
            <li>✓ 언제든 모든 데이터 삭제 가능</li>
          </ul>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <button
            type="button"
            aria-expanded={isDetailOpen}
            aria-controls="trust-moment-detail"
            onClick={handleToggleDetail}
            className="text-sm font-medium text-gray-700 underline-offset-2 hover:underline"
          >
            자세히 보기 {isDetailOpen ? "▴" : "▾"}
          </button>
          {isDetailOpen && (
            <p id="trust-moment-detail" className="mt-3 text-sm text-gray-600">
              온보딩 답변은 Thought Map 생성을 위한 신호로만 쓰이고, 프로필 공개 시
              원문이 노출되지 않습니다.
            </p>
          )}
        </div>

        <div className="space-y-3 border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={handleDataManagementClick}
            className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-700"
            aria-label="내 데이터 관리 열기"
          >
            내 데이터 관리
          </button>
          {isDataPanelOpen && (
            <div
              role="region"
              aria-label="데이터 관리 패널"
              className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600"
            >
              데이터는 언제든 삭제 요청할 수 있으며, 기록 관리 정책은 온보딩 완료 후
              설정 화면에서도 다시 확인할 수 있습니다.
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleProceed}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          시작하기
        </button>
      </div>
    </section>
  );
}
