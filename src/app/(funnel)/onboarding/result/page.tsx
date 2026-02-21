"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ThoughtMapResult } from "../components/ThoughtMapResult";
import type { ThoughtMapOutput } from "@/application/dtos/thought-map-output";
import Link from "next/link";

function ResultContent() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");

  if (!dataParam) {
    return (
      <div className="text-center">
        <p className="text-gray-600">결과 데이터가 없습니다.</p>
        <Link
          href="/onboarding"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          온보딩 시작하기
        </Link>
      </div>
    );
  }

  let data: ThoughtMapOutput;
  try {
    data = JSON.parse(decodeURIComponent(dataParam));
    // Mark onboarding as complete
    if (typeof window !== "undefined") {
      localStorage.setItem("ps_onboarding_done", "true");
    }
  } catch {
    return (
      <div className="text-center">
        <p className="text-gray-600">결과를 불러올 수 없습니다.</p>
        <Link
          href="/onboarding"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          다시 시작하기
        </Link>
      </div>
    );
  }

  return (
    <ThoughtMapResult data={data} />
  );
}

export default function ResultPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">나의 Thought Map</h1>
        <p className="mt-2 text-gray-600">
          당신의 생각이 어떤 모습인지 확인해보세요
        </p>
      </div>

      <Suspense fallback={<div className="text-center">로딩 중...</div>}>
        <ResultContent />
      </Suspense>
    </main>
  );
}
