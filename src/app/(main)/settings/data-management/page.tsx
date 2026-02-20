"use client";

import { useEffect } from "react";
import Link from "next/link";

function emitAnalytics(eventName: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("perspectiveshift:analytics", {
        detail: { type: eventName, payload: { timestamp: Date.now() } },
      }),
    );
  }
}

export default function DataManagementPage() {
  useEffect(() => {
    emitAnalytics("data_mgmt_view");
  }, []);

  const handleExportData = () => {
    emitAnalytics("data_export_click");
    alert("준비 중입니다");
  };

  const handleDeleteRequest = () => {
    emitAnalytics("data_delete_request");
    const confirmed = window.confirm(
      "정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    );
    if (confirmed) {
      emitAnalytics("data_delete_confirm");
    }
  };

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900">데이터 관리</h1>
      <p className="text-sm text-gray-600">
        PerspectiveShift에서 저장하는 데이터를 확인하고 관리할 수 있습니다.
      </p>

      {/* Data overview section */}
      <section className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-800">저장된 데이터</h2>
        <ul className="space-y-1 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-gray-400">-</span>
            <span>닉네임</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-gray-400">-</span>
            <span>입장 프로필 (Stance Profile)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-gray-400">-</span>
            <span>대화 기록 (Dialogue History)</span>
          </li>
        </ul>
      </section>

      {/* Export data */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-800">데이터 내보내기</h2>
        <p className="mt-1 text-xs text-gray-500">
          저장된 데이터를 파일로 내보낼 수 있습니다.
        </p>
        <button
          type="button"
          onClick={handleExportData}
          className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          데이터 내보내기
        </button>
      </section>

      {/* Delete request */}
      <section className="rounded-xl border border-red-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-red-700">데이터 삭제</h2>
        <p className="mt-1 text-xs text-gray-500">
          모든 데이터를 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
        </p>
        <button
          type="button"
          onClick={handleDeleteRequest}
          className="mt-3 w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          데이터 삭제 요청
        </button>
      </section>

      {/* Privacy policy link */}
      <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <Link
          href="/privacy"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2"
        >
          개인정보 처리방침 보기
        </Link>
      </section>
    </main>
  );
}
