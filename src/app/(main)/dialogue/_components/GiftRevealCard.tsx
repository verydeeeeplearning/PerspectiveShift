"use client";

interface GiftRevealCardProps {
  text: string;
}

export default function GiftRevealCard({ text }: GiftRevealCardProps) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 p-6 text-center">
      <span className="text-3xl" role="img" aria-label="편지">
        💌
      </span>
      <p className="mt-2 text-sm text-gray-500">상대방이 당신에게 남긴 한 마디</p>
      <p className="mt-3 text-lg font-medium">{text}</p>
    </div>
  );
}
