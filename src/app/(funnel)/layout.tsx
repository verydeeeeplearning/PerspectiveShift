import Link from "next/link";

export default function FunnelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 inset-x-0 h-14 bg-white z-50 flex items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-gray-900">
          PerspectiveShift
        </Link>
        <Link
          href="/"
          aria-label="닫기"
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Link>
      </header>
      <main className="pt-14 px-4 py-8">{children}</main>
    </div>
  );
}
