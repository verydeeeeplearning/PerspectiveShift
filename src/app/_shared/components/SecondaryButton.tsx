"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface SecondaryButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  children: ReactNode;
}

export function SecondaryButton({
  children,
  disabled,
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      className={`
        h-10 px-5 rounded-pill
        bg-transparent border border-border-soft
        text-text-primary text-sm font-medium
        active:bg-border-soft active:scale-[0.98] transition-all
        focus:outline-none focus:ring-4 focus:ring-border-focus
        disabled:opacity-50 disabled:pointer-events-none
      `.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
