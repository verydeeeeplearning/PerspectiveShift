"use client";

import { useMemo } from "react";
import type { ThoughtMapOutput } from "@/application/dtos/thought-map-output";
import {
  GenerateShareCardUseCase,
  type ShareCardOutput,
} from "@/application/use-cases/generate-share-card";
import { ShareCardPreview } from "../../components/ShareCardPreview";

interface ShareCardProps {
  data: ThoughtMapOutput;
  onShare?: () => void;
}

const MAP_TYPE_SLUGS: Record<string, string> = {
  BALANCE_SEEKER: "balance-seeker",
  LIBERTY_INNOVATOR: "liberty-innovator",
  FAIRNESS_GUARDIAN: "fairness-guardian",
  PRAGMATIC_MEDIATOR: "pragmatic-mediator",
  SYSTEM_CHALLENGER: "system-challenger",
  TRADITION_STABILIZER: "tradition-stabilizer",
};

function buildShareText(data: ThoughtMapOutput): string {
  return `${data.mapType.emoji} ${data.mapType.alias}\n${data.mapType.description}`;
}

export function ShareCard({ data, onShare }: ShareCardProps) {
  const card = useMemo<ShareCardOutput>(() => {
    const useCase = new GenerateShareCardUseCase();
    return useCase.execute({
      type: "ALIAS",
      vector: data.vector,
      alias: data.alias,
    });
  }, [data.alias, data.vector]);

  const handleShare = async () => {
    onShare?.();

    if (typeof navigator === "undefined" || typeof window === "undefined") {
      return;
    }

    const text = buildShareText(data);
    const slug = MAP_TYPE_SLUGS[data.mapType.name] ?? "balance-seeker";
    const typeUrl = `${window.location.origin}/types/${slug}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `PerspectiveShift - ${data.mapType.alias}`,
          text,
          url: typeUrl,
        });
        return;
      } catch {
        // Fall back to clipboard when share sheet is dismissed or unavailable.
      }
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(`${text}\n${typeUrl}`);
    }
  };

  return <ShareCardPreview card={card} onShare={handleShare} />;
}
