"use client";

interface AffectiveWarmthSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function AffectiveWarmthSlider({ value, onChange }: AffectiveWarmthSliderProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        이 대화 상대에 대한 호감/온도
      </label>
      <div className="flex items-center gap-3">
        <span className="text-sm text-blue-500">춥다</span>
        <input
          type="range"
          min={0}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gradient-to-r from-blue-200 to-red-300"
          aria-label="Affective Warmth"
        />
        <span className="text-sm text-red-500">따뜻하다</span>
      </div>
      <div className="text-center text-sm font-medium text-gray-600">{value} / 10</div>
    </div>
  );
}
