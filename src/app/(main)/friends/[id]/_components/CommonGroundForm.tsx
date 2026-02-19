"use client";

import { useState } from "react";

export interface CommonGroundFormProps {
  sessionId: string;
  onSubmit: (data: {
    agreedPoint: string;
    differentPoint: string;
    curiousPoint: string;
  }) => void;
  disabled?: boolean;
}

export function CommonGroundForm({
  sessionId,
  onSubmit,
  disabled = false,
}: CommonGroundFormProps) {
  const [agreedPoint, setAgreedPoint] = useState("");
  const [differentPoint, setDifferentPoint] = useState("");
  const [curiousPoint, setCuriousPoint] = useState("");

  const canSubmit =
    agreedPoint.trim() && differentPoint.trim() && curiousPoint.trim();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      agreedPoint: agreedPoint.trim(),
      differentPoint: differentPoint.trim(),
      curiousPoint: curiousPoint.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Common Ground Check">
      <h3 className="text-lg font-semibold mb-4">Common Ground Check</h3>
      <p className="text-sm text-gray-600 mb-4">3분 안에 작성해보세요</p>

      <div className="space-y-4">
        <div>
          <label htmlFor={`agreed-${sessionId}`} className="block text-sm font-medium mb-1">
            우리가 동의하는 1가지
          </label>
          <textarea
            id={`agreed-${sessionId}`}
            value={agreedPoint}
            onChange={(e) => setAgreedPoint(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
            rows={2}
            placeholder="우리 둘 다 동의하는 것은..."
            disabled={disabled}
          />
        </div>

        <div>
          <label htmlFor={`different-${sessionId}`} className="block text-sm font-medium mb-1">
            아직 다른 1가지
          </label>
          <textarea
            id={`different-${sessionId}`}
            value={differentPoint}
            onChange={(e) => setDifferentPoint(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
            rows={2}
            placeholder="아직 의견이 다른 부분은..."
            disabled={disabled}
          />
        </div>

        <div>
          <label htmlFor={`curious-${sessionId}`} className="block text-sm font-medium mb-1">
            더 알아보고 싶은 1가지
          </label>
          <textarea
            id={`curious-${sessionId}`}
            value={curiousPoint}
            onChange={(e) => setCuriousPoint(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
            rows={2}
            placeholder="더 알아보고 싶은 것은..."
            disabled={disabled}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled || !canSubmit}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
      >
        제출하기
      </button>
    </form>
  );
}
