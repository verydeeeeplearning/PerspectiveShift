"use client";

import { useMemo, useState } from "react";
import { ApplyAnchorFilterUseCase } from "@/application/use-cases/apply-anchor-filter";
import type { AnchorType } from "@/domain/value-objects/anchor-type";
import type { EnergyLevelKey } from "@/domain/value-objects/energy-level";

export interface AnchorFilterSelection {
  anchorType: AnchorType;
  anchorValue: string;
  differenceLevel: number;
  appliedRange: { min: number; max: number };
}

interface AnchorFilterPanelProps {
  energyLevel: EnergyLevelKey;
  onApply: (selection: AnchorFilterSelection) => void;
}

const ANCHOR_TYPE_LABELS: Record<AnchorType, string> = {
  age_group: "연령대",
  job_category: "직업",
  gender: "성별",
  region: "지역",
};

const ANCHOR_OPTIONS: Record<AnchorType, string[]> = {
  age_group: ["20대", "30대", "40대", "50대+"],
  job_category: ["학생", "직장인", "자영업", "연구직"],
  gender: ["여성", "남성", "논바이너리"],
  region: ["수도권", "중부", "동남", "서남"],
};

function describeEnergyCap(energyLevel: EnergyLevelKey): string {
  if (energyLevel === "LOW") return "0.4 max";
  if (energyLevel === "NORMAL") return "0.7 max";
  return "1.0 max";
}

export function AnchorFilterPanel({
  energyLevel,
  onApply,
}: AnchorFilterPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [anchorType, setAnchorType] = useState<AnchorType>("age_group");
  const [anchorValue, setAnchorValue] = useState("");
  const [differenceSlider, setDifferenceSlider] = useState(50);
  const useCase = useMemo(() => new ApplyAnchorFilterUseCase(), []);

  const previewValue = anchorValue || ANCHOR_OPTIONS[anchorType][0];
  const differenceLevel = Math.round((differenceSlider / 100) * 1000) / 1000;
  const previewRange = useMemo(() => {
    const result = useCase.execute({
      anchorType,
      anchorValue: previewValue,
      differenceLevel,
      energyLevel,
      candidates: [],
    });
    return result.appliedRange;
  }, [anchorType, differenceLevel, energyLevel, previewValue, useCase]);

  const handleApply = () => {
    if (!anchorValue) return;

    const selection: AnchorFilterSelection = {
      anchorType,
      anchorValue,
      differenceLevel,
      appliedRange: previewRange,
    };
    onApply(selection);
    window.dispatchEvent(
      new CustomEvent("perspectiveshift:analytics", {
        detail: {
          type: "anchor_filter_set",
          payload: {
            timestamp: Date.now(),
            ...selection,
            energyLevel,
          },
        },
      }),
    );
  };

  return (
    <section className="rounded-xl border border-border-soft bg-surface-card">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-text-primary">앵커 필터</span>
        <span className="text-text-tertiary">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-border-soft px-4 py-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">
              앵커 유형
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ANCHOR_TYPE_LABELS) as AnchorType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setAnchorType(type);
                    setAnchorValue("");
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    anchorType === type
                      ? "bg-accent-primary text-text-inverse"
                      : "bg-accent-primary-soft text-text-secondary"
                  }`}
                >
                  {ANCHOR_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">
              앵커 값
            </p>
            <div className="flex flex-wrap gap-2">
              {ANCHOR_OPTIONS[anchorType].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAnchorValue(option)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    anchorValue === option
                      ? "bg-accent-primary text-text-inverse"
                      : "bg-accent-primary-soft text-text-secondary"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="difference-level-slider"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-tertiary"
            >
              다름의 정도
            </label>
            <input
              id="difference-level-slider"
              type="range"
              min={0}
              max={100}
              value={differenceSlider}
              onChange={(event) =>
                setDifferenceSlider(Number(event.target.value))
              }
              className="w-full"
              aria-label="다름의 정도"
            />
            <p className="mt-2 text-xs text-text-secondary">
              미리보기 범위: {previewRange.min.toFixed(3)} -{" "}
              {previewRange.max.toFixed(3)} (에너지 상한:{" "}
              {describeEnergyCap(energyLevel)})
            </p>
          </div>

          <button
            type="button"
            onClick={handleApply}
            disabled={!anchorValue}
            className="w-full rounded-lg bg-accent-primary py-2.5 text-sm font-medium text-text-inverse disabled:cursor-not-allowed disabled:opacity-40"
          >
            필터 적용
          </button>
        </div>
      )}
    </section>
  );
}

