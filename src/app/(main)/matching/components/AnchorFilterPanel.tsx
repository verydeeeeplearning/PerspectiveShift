"use client";

import { useState } from "react";
import { ALL_ANCHOR_TYPES, getAnchorLabel, type AnchorType } from "@/domain/value-objects/anchor-type";

interface AnchorFilterPanelProps {
  onApply: (anchorType: AnchorType, anchorValue: string, differenceSlider: number) => void;
}

const ANCHOR_OPTIONS: Record<AnchorType, string[]> = {
  gender: ["남성", "여성", "기타"],
  job_category: ["학생", "직장인", "자영업", "전문직", "프리랜서", "기타"],
  age_group: ["10대", "20대", "30대", "40대", "50대 이상"],
  region: ["수도권", "충청", "전라", "경상", "강원/제주", "기타"],
};

export function AnchorFilterPanel({ onApply }: AnchorFilterPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [anchorType, setAnchorType] = useState<AnchorType>("age_group");
  const [anchorValue, setAnchorValue] = useState("");
  const [differenceSlider, setDifferenceSlider] = useState(50);

  const handleApply = () => {
    if (!anchorValue) return;
    onApply(anchorType, anchorValue, differenceSlider);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-gray-700">공통점 기반 필터</span>
        <span className="text-gray-400">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4">
          {/* Anchor Type Selection */}
          <div>
            <p className="mb-2 text-xs font-medium text-gray-500">공통점 선택</p>
            <div className="flex flex-wrap gap-2">
              {ALL_ANCHOR_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setAnchorType(type);
                    setAnchorValue("");
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    anchorType === type
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {getAnchorLabel(type)}
                </button>
              ))}
            </div>
          </div>

          {/* Anchor Value Selection */}
          <div>
            <p className="mb-2 text-xs font-medium text-gray-500">
              나의 {getAnchorLabel(anchorType)}
            </p>
            <div className="flex flex-wrap gap-2">
              {ANCHOR_OPTIONS[anchorType].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAnchorValue(opt)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    anchorValue === opt
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Difference Slider */}
          <div>
            <p className="mb-2 text-xs font-medium text-gray-500">다름의 정도</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">비슷한 상대</span>
              <input
                type="range"
                min={0}
                max={100}
                value={differenceSlider}
                onChange={(e) => setDifferenceSlider(Number(e.target.value))}
                className="flex-1"
                aria-label="다름의 정도 슬라이더"
              />
              <span className="text-xs text-gray-400">다른 상대</span>
            </div>
          </div>

          {/* Apply Button */}
          <button
            type="button"
            onClick={handleApply}
            disabled={!anchorValue}
            className="w-full rounded-lg bg-indigo-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            필터 적용
          </button>
        </div>
      )}
    </div>
  );
}
