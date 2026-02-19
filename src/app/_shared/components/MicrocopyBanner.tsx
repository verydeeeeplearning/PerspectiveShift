"use client";

import type { MicrocopyTone } from "@/domain/value-objects/microcopy";

interface MicrocopyBannerProps {
  text: string;
  tone: MicrocopyTone;
}

const TONE_STYLES: Record<MicrocopyTone, string> = {
  safety: "bg-green-50 text-green-700",
  autonomy: "bg-blue-50 text-blue-700",
  curiosity: "bg-purple-50 text-purple-700",
  competence: "bg-amber-50 text-amber-700",
};

export default function MicrocopyBanner({ text, tone }: MicrocopyBannerProps) {
  return (
    <div className={`rounded-lg px-4 py-2 text-center text-sm ${TONE_STYLES[tone]}`} role="status">
      {text}
    </div>
  );
}
