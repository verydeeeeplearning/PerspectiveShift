"use client";

import { motion } from "framer-motion";
import type { ReactNode, MouseEventHandler } from "react";
import { springSnappy } from "@/app/_shared/motion";

interface PrimaryButtonProps {
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  "aria-label"?: string;
}

export function PrimaryButton({
  children,
  loading = false,
  fullWidth = false,
  disabled,
  type = "button",
  onClick,
  "aria-label": ariaLabel,
}: PrimaryButtonProps) {
  return (
    <motion.button
      className={`
        relative overflow-hidden
        h-12 px-6 rounded-pill
        gradient-cta text-text-inverse font-semibold text-base
        shadow-cta
        focus:outline-none focus:ring-4 focus:ring-border-focus
        disabled:bg-cta-disabled disabled:text-text-tertiary disabled:shadow-none
        disabled:pointer-events-none
        ${fullWidth ? "block w-full mx-auto" : ""}
      `.trim()}
      whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(44, 62, 80, 0.2)" }}
      whileTap={{ scale: 0.96 }}
      transition={springSnappy}
      disabled={disabled || loading}
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
        {loading && (
          <span className="inline-flex gap-1" aria-label="로딩 중">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
          </span>
        )}
      </span>
    </motion.button>
  );
}
