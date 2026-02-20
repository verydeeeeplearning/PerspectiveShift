"use client";

import { motion } from "framer-motion";
import type { ReactNode, MouseEventHandler } from "react";
import { springSnappy } from "@/app/_shared/motion";

interface SecondaryButtonProps {
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  "aria-label"?: string;
}

export function SecondaryButton({
  children,
  disabled,
  type = "button",
  onClick,
  "aria-label": ariaLabel,
}: SecondaryButtonProps) {
  return (
    <motion.button
      className={`
        h-10 px-5 rounded-pill
        bg-transparent border border-border-soft
        text-text-primary text-sm font-medium
        hover:bg-accent-primary-soft hover:border-accent-primary/20
        focus:outline-none focus:ring-4 focus:ring-border-focus
        disabled:opacity-50 disabled:pointer-events-none
        transition-colors
      `.trim()}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={springSnappy}
      disabled={disabled}
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </motion.button>
  );
}
