"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export function PrimaryButton({
  children,
  loading = false,
  fullWidth = false,
  disabled,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={`
        h-12 px-6 rounded-pill
        bg-cta-primary text-text-inverse font-semibold text-base
        shadow-cta
        active:scale-[0.98] transition-transform
        focus:outline-none focus:ring-4 focus:ring-border-focus
        disabled:bg-cta-disabled disabled:text-text-tertiary disabled:shadow-none
        ${fullWidth ? "w-full max-w-xs mx-auto" : ""}
      `.trim()}
      disabled={disabled || loading}
      {...props}
    >
      <span className="inline-flex items-center gap-2">
        {children}
        {loading && (
          <span className="inline-flex gap-0.5" aria-label="로딩 중">
            <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
            <span className="w-1 h-1 rounded-full bg-current animate-pulse [animation-delay:150ms]" />
            <span className="w-1 h-1 rounded-full bg-current animate-pulse [animation-delay:300ms]" />
          </span>
        )}
      </span>
    </button>
  );
}
