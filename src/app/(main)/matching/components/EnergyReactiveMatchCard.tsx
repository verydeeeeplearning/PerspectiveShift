"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { MatchCandidateOutput } from "@/application/dtos/match-output";
import { SelectEnergyLevelUseCase } from "@/application/use-cases/select-energy-level";
import { BuildMatchCardUseCase } from "@/application/use-cases/build-match-card";
import type { EnergyLevelKey } from "@/domain/value-objects/energy-level";
import { EnergySelector } from "./EnergySelector";
import { MatchCardV3 } from "./MatchCardV3";
import { springSoft } from "@/app/_shared/motion";

export type EnergyMatchingEventName =
  | "energy_check_select_high"
  | "energy_check_select_medium"
  | "energy_check_select_low"
  | "energy_check_change"
  | "matching_card_render_time";

interface EnergyReactiveMatchCardProps {
  candidate: MatchCandidateOutput | null;
  candidateCount: number;
  topic?: string;
  onStart: () => void;
  onDecline: () => void;
  onEvent?: (
    eventName: EnergyMatchingEventName,
    payload: Record<string, unknown>,
  ) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toSelectEventName(key: EnergyLevelKey): EnergyMatchingEventName {
  if (key === "HIGH") return "energy_check_select_high";
  if (key === "LOW") return "energy_check_select_low";
  return "energy_check_select_medium";
}

function toCtaLabel(key: EnergyLevelKey): string {
  return key === "LOW" ? "가볍게 5분 시작" : "대화 시작";
}

export function EnergyReactiveMatchCard({
  candidate,
  candidateCount,
  topic = "관점이 갈리는 오늘의 이슈",
  onStart,
  onDecline,
  onEvent,
}: EnergyReactiveMatchCardProps) {
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevelKey>("NORMAL");
  const selectionStartAtRef = useRef<number>(performance.now());
  const hasTrackedInitialSelectionRef = useRef(false);

  const emitEvent = useCallback(
    (
      eventName: EnergyMatchingEventName,
      payload: Record<string, unknown> = {},
    ) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("perspectiveshift:analytics", {
            detail: {
              type: eventName,
              payload: {
                timestamp: Date.now(),
                ...payload,
              },
            },
          }),
        );
      }
      onEvent?.(eventName, payload);
    },
    [onEvent],
  );

  const energyResult = useMemo(() => {
    const useCase = new SelectEnergyLevelUseCase();
    return useCase.execute(selectedEnergy);
  }, [selectedEnergy]);

  const cardData = useMemo(() => {
    const useCase = new BuildMatchCardUseCase();
    const [bandMin, bandMax] = energyResult.matchingParams.distanceBand;
    const baseDistance = candidate?.distance ?? (bandMin + bandMax) / 2;
    const adjustedDistance = clamp(
      baseDistance + energyResult.adjustment.distanceDelta,
      bandMin,
      bandMax,
    );

    return useCase.execute({
      distance: adjustedDistance,
      topic,
      estimatedMinutes: energyResult.matchingParams.timeBudgetMinutes,
      trailerText:
        selectedEnergy === "LOW"
          ? "지금 에너지에 맞춰 가벼운 템포로 조정했어요."
          : "지금 에너지에 맞춰 대화 템포를 자동으로 조정했어요.",
    });
  }, [
    candidate?.distance,
    energyResult.adjustment.distanceDelta,
    energyResult.matchingParams.distanceBand,
    energyResult.matchingParams.timeBudgetMinutes,
    selectedEnergy,
    topic,
  ]);

  const handleEnergySelect = (nextEnergy: EnergyLevelKey) => {
    selectionStartAtRef.current = performance.now();
    emitEvent(toSelectEventName(nextEnergy), { energy: nextEnergy });
    if (nextEnergy !== selectedEnergy) {
      emitEvent("energy_check_change", {
        previousEnergy: selectedEnergy,
        nextEnergy,
      });
    }
    setSelectedEnergy(nextEnergy);
  };

  useEffect(() => {
    if (!hasTrackedInitialSelectionRef.current) {
      emitEvent(toSelectEventName(selectedEnergy), { energy: selectedEnergy });
      hasTrackedInitialSelectionRef.current = true;
    }

    const elapsedMs = Math.round(performance.now() - selectionStartAtRef.current);
    emitEvent("matching_card_render_time", {
      energy: selectedEnergy,
      elapsedMs,
    });
  }, [emitEvent, selectedEnergy]);

  return (
    <motion.section
      className="mb-6 space-y-4 rounded-card border border-border-soft bg-surface-card p-5 shadow-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springSoft}
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold text-text-primary">지금 에너지 체크</p>
        <EnergySelector selected={selectedEnergy} onSelect={handleEnergySelect} />
      </div>

      <MatchCardV3
        topic={cardData.topic}
        distanceLabel={cardData.distanceLabel}
        estimatedMinutes={cardData.estimatedMinutes}
        difficultyRange={energyResult.matchingParams.difficultyRange}
        ctaLabel={toCtaLabel(selectedEnergy)}
        socialProof={
          candidateCount > 0
            ? `현재 ${candidateCount}명의 후보가 준비되어 있어요`
            : undefined
        }
        trailer={cardData.trailer}
        onStart={onStart}
        onDecline={onDecline}
      />
    </motion.section>
  );
}
