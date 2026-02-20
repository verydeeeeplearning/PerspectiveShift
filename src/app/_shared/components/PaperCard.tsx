"use client";

import { motion } from "framer-motion";
import type { HTMLAttributes, ReactNode } from "react";
import { springSnappy } from "@/app/_shared/motion";

export type PaperCardVariant =
  | "default"
  | "elevated"
  | "selected"
  | "semantic"
  | "interactive";

export type PaperCardPadding = "compact" | "spacious";

export type SemanticAccent = "similarity" | "difference";

interface PaperCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  variant?: PaperCardVariant;
  padding?: PaperCardPadding;
  semanticAccent?: SemanticAccent;
  children: ReactNode;
}

const PADDING_CLASS: Record<PaperCardPadding, string> = {
  compact: "p-4",
  spacious: "p-6",
};

const VARIANT_CLASS: Record<PaperCardVariant, string> = {
  default: "bg-surface-card border border-border-soft shadow-paper",
  elevated: "bg-surface-card border border-border-soft shadow-card",
  selected: "bg-surface-card border-2 border-indigo-depth shadow-paper",
  semantic: "bg-surface-card border border-border-soft shadow-paper",
  interactive:
    "bg-surface-card border border-border-soft shadow-paper cursor-pointer",
};

const ACCENT_CLASS: Record<SemanticAccent, string> = {
  similarity: "border-l-[3px] border-l-semantic-similarity",
  difference: "border-l-[3px] border-l-semantic-difference",
};

export function PaperCard({
  variant = "default",
  padding = "compact",
  semanticAccent,
  children,
  ...props
}: PaperCardProps) {
  const showAccent = variant === "semantic" && semanticAccent;
  const isInteractive = variant === "interactive";

  const className = `
    rounded-card
    ${PADDING_CLASS[padding]}
    ${VARIANT_CLASS[variant]}
    ${showAccent ? ACCENT_CLASS[semanticAccent] : ""}
  `.trim();

  if (isInteractive) {
    return (
      <motion.div
        className={className}
        whileHover={{
          y: -2,
          boxShadow: "0 4px 16px rgba(44, 62, 80, 0.08)",
        }}
        whileTap={{ scale: 0.98 }}
        transition={springSnappy}
        {...(props as Record<string, unknown>)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
