"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/_shared/hooks/useAuth";
import { PrimaryButton } from "@/app/_shared/components/PrimaryButton";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/friends");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-border-soft border-t-indigo-depth" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-[var(--container-x)]">
      <div className="max-w-sm w-full text-center space-y-10">
        {/* Section Label */}
        <span className="text-[11px] font-semibold tracking-widest uppercase text-text-secondary">
          시작하기
        </span>

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
            <PrimaryButton fullWidth>생각 발견 시작하기</PrimaryButton>
          </Link>

          <p className="flex items-center justify-center gap-1 text-xs text-text-tertiary">
            <span aria-hidden="true">&#x1f512;</span>
            대화는 익명 · 데이터는 내 손 안에{" "}
            <Link
              href="/settings/privacy"
              className="underline hover:text-text-secondary"
            >
              내 데이터 관리
            </Link>
          </p>

          <p className="text-sm text-text-tertiary">
            이미 계정이 있나요?{" "}
            <Link
              href="/auth/login"
              className="text-text-primary font-medium hover:underline"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
