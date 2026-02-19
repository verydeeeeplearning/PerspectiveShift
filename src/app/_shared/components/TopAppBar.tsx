"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export type TopAppBarVariant = "wordmark" | "title" | "minimal" | "immersive";

interface TopAppBarProps {
  variant?: TopAppBarVariant;
  title?: string;
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
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export function TopAppBar({
  variant = "wordmark",
  title,
  parentRoute,
  rightAction,
}: TopAppBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (parentRoute) {
      router.push(parentRoute);
    } else {
      router.back();
    }
  };

  const handleClose = () => {
    if (parentRoute) {
      router.push(parentRoute);
    } else {
      router.push("/");
    }
  };

  const isImmersive = variant === "immersive";
  const showBack = variant === "title" || variant === "minimal";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 h-14 ${
        isImmersive
          ? "bg-transparent"
          : "bg-paper border-b border-border-divider"
      }`}
    >
      <div className="flex items-center justify-between h-full px-4 max-w-lg mx-auto">
        {/* Left */}
        <div className="w-11 flex items-center">
          {showBack && (
            <button
              onClick={handleBack}
              aria-label="뒤로 가기"
              className="w-11 h-11 flex items-center justify-center text-text-primary hover:text-indigo-depth transition-colors"
            >
              <BackIcon />
            </button>
          )}
          {variant === "wordmark" && (
            <span className="text-lg font-heading font-semibold text-text-primary tracking-tight">
              PerspectiveShift
            </span>
          )}
          {isImmersive && (
            <button
              onClick={handleClose}
              aria-label="뒤로 가기"
              className="w-11 h-11 flex items-center justify-center text-text-primary hover:text-indigo-depth transition-colors"
            >
              <BackIcon />
            </button>
          )}
        </div>

        {/* Center */}
        {variant === "title" && title && (
          <h1 className="text-base font-semibold text-text-primary truncate">
            {title}
          </h1>
        )}

        {/* Right */}
        <div className="w-11 flex items-center justify-end">
          {isImmersive && (
            <button
              onClick={handleClose}
              aria-label="닫기"
              className="w-11 h-11 flex items-center justify-center text-text-primary hover:text-indigo-depth transition-colors"
            >
              <CloseIcon />
            </button>
          )}
          {!isImmersive && rightAction}
        </div>
      </div>
    </header>
  );
}
