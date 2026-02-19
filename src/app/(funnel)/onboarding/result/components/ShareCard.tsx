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

    if (typeof navigator === "undefined") {
      return;
    }

    const text = buildShareText(data);
    if (typeof navigator.share === "function") {
      await navigator.share({
        title: "PerspectiveShift 유형 카드",
        text,
      });
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    }
  };

  return <ShareCardPreview card={card} onShare={handleShare} />;
}
