"use client";

import { useAuth } from "@/app/_shared/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { isAuthenticated, loading, loginWithGoogle, loginWithKakao } =
    useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace("/friends");
  }, [isAuthenticated, router]);

  if (loading) return <div className="p-6">로딩 중...</div>;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-sm w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold">PerspectiveShift</h1>
        <p className="text-gray-600">로그인하여 관계를 확장하세요</p>
        <div className="space-y-3">
          <button
            onClick={() => loginWithGoogle()}
            className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Google로 계속하기
          </button>
          <button
            onClick={() => loginWithKakao()}
            className="w-full py-3 px-4 bg-[#FEE500] text-[#000000D9] rounded-lg hover:bg-[#FDD800] font-medium"
          >
            카카오로 계속하기
          </button>
        </div>
      </div>
    </main>
  );
}
