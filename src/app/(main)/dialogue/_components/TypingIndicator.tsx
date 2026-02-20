"use client";

interface TypingIndicatorProps {
  label?: string;
}

export function TypingIndicator({
  label = "Someone is typing...",
}: TypingIndicatorProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface-card px-3 py-1.5 text-sm text-text-secondary"
    >
      <span>{label}</span>
      <span className="inline-flex items-center gap-1" aria-hidden="true">
        <span
          data-testid="typing-dot"
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-tertiary"
        />
        <span
          data-testid="typing-dot"
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-tertiary [animation-delay:120ms]"
        />
        <span
          data-testid="typing-dot"
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-tertiary [animation-delay:240ms]"
        />
      </span>
    </div>
  );
}

