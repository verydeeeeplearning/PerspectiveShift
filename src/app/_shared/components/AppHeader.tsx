"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  parentRoute?: string;
  rightAction?: ReactNode;
}

const BackIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export function AppHeader({
  title,
  showBack = false,
  parentRoute,
  rightAction,
}: AppHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (parentRoute) {
      router.push(parentRoute);
    } else {
      router.back();
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 h-14 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-4 max-w-lg mx-auto">
        <div className="w-10">
          {showBack && (
            <button
              onClick={handleBack}
              aria-label="뒤로 가기"
              className="p-1 -ml-1 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <BackIcon />
            </button>
          )}
        </div>

        {title && (
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
        )}

        <div className="w-10 flex justify-end">{rightAction}</div>
      </div>
    </header>
  );
}
