"use client";

interface Badge {
  type: string;
  label: string;
  emoji: string;
  description: string;
  isUnlocked: boolean;
}

interface BadgeGridProps {
  badges: Badge[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {badges.map((badge) => (
        <div
          key={badge.type}
          className={`flex flex-col items-center rounded-xl border p-4 text-center transition-colors ${
            badge.isUnlocked
              ? "border-indigo-200 bg-indigo-50/50"
              : "border-gray-100 bg-gray-50 opacity-50"
          }`}
        >
          <span className="text-3xl" role="img" aria-label={badge.label}>
            {badge.isUnlocked ? badge.emoji : "🔒"}
          </span>
          <p className="mt-2 text-sm font-semibold text-gray-800">{badge.label}</p>
          <p className="mt-1 text-[10px] text-gray-500 leading-tight">{badge.description}</p>
        </div>
      ))}
    </div>
  );
}
