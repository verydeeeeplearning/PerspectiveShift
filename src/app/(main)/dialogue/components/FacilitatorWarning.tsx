"use client";

interface FacilitatorWarningProps {
  type: "tone" | "drift";
  suggestion: string;
}

export function FacilitatorWarning({
  type,
  suggestion,
}: FacilitatorWarningProps) {
  const title =
    type === "tone" ? "톤 체크 알림" : "논점 이탈 알림";

  return (
    <div
      className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4"
      role="alert"
    >
      <h4 className="font-medium text-orange-800 mb-1">{title}</h4>
      <p className="text-sm text-orange-700">{suggestion}</p>
      <p className="text-xs text-orange-500 mt-2">
        이것은 제안입니다. 내용을 수정하거나 그대로 제출할 수 있습니다.
      </p>
    </div>
  );
}
