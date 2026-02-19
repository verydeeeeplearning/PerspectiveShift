"use client";

interface FeelHeardSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const labels = ["", "전혀 못 느낌", "조금", "보통", "많이", "완전히 이해받음"];

export function FeelHeardSlider({ value, onChange }: FeelHeardSliderProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        상대가 내 말을 제대로 이해했다고 느꼈나요?
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`flex-1 rounded-lg border-2 px-3 py-2 text-center text-sm transition-colors ${
              value === score
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
            aria-label={`Feel Heard ${score}점`}
          >
            <div className="text-lg font-bold">{score}</div>
            <div className="text-xs">{labels[score]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
