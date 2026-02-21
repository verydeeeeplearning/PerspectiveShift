"use client";

import Link from "next/link";
import { PrimaryButton } from "@/app/_shared/components/PrimaryButton";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-[var(--container-x)]">
      <div className="max-w-sm w-full text-center space-y-10">
        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="text-[32px] leading-[1.2] font-bold font-heading text-text-primary tracking-[-0.02em]">
            새로운 관점을
            <br />
            만나보세요
          </h1>
          <p className="text-base leading-relaxed text-text-secondary">
            안전하고 구조화된 대화를 통해
            <br />
            다른 시각을 이해해보세요
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Link href="/onboarding" className="block">
            <PrimaryButton fullWidth>시작하기</PrimaryButton>
          </Link>

          <p className="flex items-center justify-center gap-1 text-xs text-text-tertiary">
            <span aria-hidden="true">&#x1f512;</span>
            대화는 익명 · 데이터는 내 손 안에
          </p>
        </div>
      </div>
    </div>
  );
}
