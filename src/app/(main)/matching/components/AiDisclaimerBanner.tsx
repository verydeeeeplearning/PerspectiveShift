"use client";

import { useEffect } from "react";

export function AiDisclaimerBanner() {
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("perspectiveshift:analytics", {
        detail: {
          type: "ai_disclaimer_view",
          payload: { timestamp: Date.now() },
        },
      }),
    );
  }, []);

  return (
    <p role="note" className="text-xs leading-relaxed text-text-tertiary">
      일부 매칭 상대는 AI일 수 있습니다. 대화 후 정확히 맞추면 리워드를
      받을 수 있어요.
    </p>
  );
}

