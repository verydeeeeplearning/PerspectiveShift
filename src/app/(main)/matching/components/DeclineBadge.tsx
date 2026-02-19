interface DeclineBadgeProps {
  text: string;
}

export function DeclineBadge({ text }: DeclineBadgeProps) {
  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-full"
      role="status"
      aria-label="조정 상태"
    >
      <span className="text-xs text-amber-700 font-medium">{text}</span>
    </div>
  );
}
