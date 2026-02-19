import type { HTMLAttributes, ReactNode } from "react";

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
    "bg-surface-card border border-border-soft shadow-paper hover:shadow-card cursor-pointer transition-shadow",
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

  return (
    <div
      className={`
        rounded-card
        ${PADDING_CLASS[padding]}
        ${VARIANT_CLASS[variant]}
        ${showAccent ? ACCENT_CLASS[semanticAccent] : ""}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
