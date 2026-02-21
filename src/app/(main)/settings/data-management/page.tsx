"use client";

export default function DataManagementPage() {

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
        <p className="mt-2 text-sm text-gray-400">준비중 입니다</p>
      </section>

      {/* Delete request */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-800">데이터 삭제 요청</h2>
        <p className="mt-2 text-sm text-gray-400">준비중 입니다</p>
      </section>

      {/* Privacy policy link */}
      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-800">개인정보 처리방침 보기</h2>
        <p className="mt-2 text-sm text-gray-400">준비중 입니다</p>
      </section>
    </main>
  );
}
