"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ThoughtMapResult } from "../components/ThoughtMapResult";
import type { ThoughtMapOutput } from "@/application/dtos/thought-map-output";
import Link from "next/link";

const THOUGHT_MAP_STORAGE_KEY = "ps-thought-map";

function parseThoughtMap(raw: string): ThoughtMapOutput | null {
  try {
    return JSON.parse(raw) as ThoughtMapOutput;
  } catch {
    return null;
  }
}

function ResultContent() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");
  const [data, setData] = useState<ThoughtMapOutput | null>(null);
  const [loadedFromCache, setLoadedFromCache] = useState(false);
  const [errorType, setErrorType] = useState<"missing" | "invalid" | null>(null);

  useEffect(() => {
    if (dataParam) {
      let parsed: ThoughtMapOutput | null = null;
      try {
        parsed = parseThoughtMap(decodeURIComponent(dataParam));
      } catch {
        parsed = null;
      }

      if (!parsed) {
        setData(null);
        setErrorType("invalid");
        setLoadedFromCache(false);
        return;
      }

      setData(parsed);
      setErrorType(null);
      setLoadedFromCache(false);

      try {
        localStorage.setItem(THOUGHT_MAP_STORAGE_KEY, JSON.stringify(parsed));
      } catch {
        // Ignore storage failures and continue rendering.
      }

      return;
    }

    try {
      const cached = localStorage.getItem(THOUGHT_MAP_STORAGE_KEY);
      if (!cached) {
        setData(null);
        setErrorType("missing");
        setLoadedFromCache(false);
        return;
      }

      const parsed = parseThoughtMap(cached);
      if (!parsed) {
        setData(null);
        setErrorType("invalid");
        setLoadedFromCache(false);
        return;
      }

      setData(parsed);
      setErrorType(null);
      setLoadedFromCache(true);
    } catch {
      setData(null);
      setErrorType("missing");
      setLoadedFromCache(false);
    }
  }, [dataParam]);

  if (!data) {
    return (
      <div className="text-center">
        <p className="text-gray-600">
          {errorType === "invalid"
            ? "결과를 불러올 수 없습니다."
            : "결과 데이터가 없습니다."}
        </p>
        <Link
          href="/onboarding"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          {errorType === "invalid" ? "다시 시작하기" : "온보딩 시작하기"}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loadedFromCache && (
        <p className="rounded-lg bg-blue-50 px-4 py-2 text-center text-xs text-blue-700">
          최근 저장된 결과를 불러왔어요.
        </p>
      )}
      <ThoughtMapResult data={data} />
    </div>
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
