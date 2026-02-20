"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/app/_shared/components/PrimaryButton";
import { SecondaryButton } from "@/app/_shared/components/SecondaryButton";
import { PaperCard } from "@/app/_shared/components/PaperCard";

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
  const router = useRouter();
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
    router.push("/settings/data-management");
  };

  const handleProceed = () => {
    emitEvent("trust_moment_proceed");
    onProceed();
  };

  return (
    <section className="mx-auto w-full max-w-xl space-y-8 text-center" aria-label="신뢰 안내">
      {/* Hero Title */}
      <h2 className="text-[32px] leading-[1.2] font-bold font-heading text-text-primary tracking-[-0.02em]">
        당신의 관점을
        <br />
        안전하게 탐색하세요
      </h2>

      <p className="text-base leading-relaxed text-text-secondary">
        PerspectiveShift는 당신의 생각을 기록하고,
        다른 관점과 안전하게 대화할 수 있는 공간입니다.
      </p>

      {/* Trust Checklist */}
      <PaperCard padding="spacious">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-2 justify-center">
            <span aria-hidden>🔒</span>
            <h3 className="text-base font-semibold text-text-primary">
              당신의 생각은 안전합니다
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-text-secondary inline-block text-left">
            <li className="flex items-start gap-2">
              <span className="text-status-safety mt-0.5">✓</span>
              <span>닉네임만 사용, 실명 비공개</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-status-safety mt-0.5">✓</span>
              <span>답변 원문은 분석 후 즉시 삭제</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-status-safety mt-0.5">✓</span>
              <span>언제든 모든 데이터 삭제 가능</span>
            </li>
          </ul>
        </div>

        {/* Detail toggle */}
        <div className="mt-4 pt-4 border-t border-border-divider">
          <button
            type="button"
            aria-expanded={isDetailOpen}
            aria-controls="trust-moment-detail"
            onClick={handleToggleDetail}
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            자세히 보기 {isDetailOpen ? "▴" : "▾"}
          </button>
          {isDetailOpen && (
            <p id="trust-moment-detail" className="mt-3 text-sm text-text-tertiary leading-relaxed">
              온보딩 답변은 Thought Map 생성을 위한 신호로만 쓰이고, 프로필 공개 시
              원문이 노출되지 않습니다.
            </p>
          )}
        </div>
      </PaperCard>

      {/* Data management */}
      <div>
        <button
          type="button"
          onClick={handleDataManagementClick}
          className="text-xs text-text-tertiary underline underline-offset-2 hover:text-text-secondary transition-colors"
          aria-label="내 데이터 관리 열기"
        >
          내 데이터 관리 →
        </button>
      </div>

      {/* CTA */}
      <PrimaryButton fullWidth onClick={handleProceed}>
        시작하기
      </PrimaryButton>
    </section>
  );
}
