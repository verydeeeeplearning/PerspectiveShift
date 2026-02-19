"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/_shared/hooks/useAuth";

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
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">
            PerspectiveShift
          </h1>
          <p className="text-lg text-gray-600">
            다양한 관점을 연결하는
            <br />
            구조화된 대화 플랫폼
          </p>
        </div>

        <Link
          href="/onboarding"
          className="block w-full py-4 bg-gray-900 text-white rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors"
        >
          생각 발견 시작하기
        </Link>

        <p className="text-sm text-gray-500">
          이미 계정이 있나요?{" "}
          <Link
            href="/auth/login"
            className="text-gray-900 font-medium hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
