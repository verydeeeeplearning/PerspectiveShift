"use client";

interface SatisfactionRatingProps {
  value: number;
  onChange: (value: number) => void;
}

const LABELS = ["", "매우 불만족", "불만족", "보통", "만족", "매우 만족"];

export function SatisfactionRating({
  value,
  onChange,
}: SatisfactionRatingProps) {
  return (
    <div
      className="flex gap-2"
      role="radiogroup"
      aria-label="만족도 선택"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`
            w-12 h-12 rounded-full text-lg font-medium transition-colors
            ${value === n
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }
          `}
          role="radio"
          aria-checked={value === n}
          aria-label={LABELS[n]}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
