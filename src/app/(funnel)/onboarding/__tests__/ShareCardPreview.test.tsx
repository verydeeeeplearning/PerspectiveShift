import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ShareCardPreview } from "../components/ShareCardPreview";
import type { ShareCardOutput } from "@/application/use-cases/generate-share-card";

const aliasCard: ShareCardOutput = {
  type: "ALIAS",
  privacyDisclaimer: "이 카드는 개인정보 없이 생성됩니다. 원문 답변은 저장되지 않습니다.",
  alias: {
    key: "BALANCED_THINKER" as never,
    label: "균형 사색가",
    emoji: "🧭",
    description: "다양한 관점을 고르게 탐색하는 유형",
  },
  topDimensions: ["TECH_REGULATION", "TECH_OPTIMISM"] as never[],
};

const thoughtMapCard: ShareCardOutput = {
  type: "THOUGHT_MAP",
  privacyDisclaimer: "이 카드는 개인정보 없이 생성됩니다. 원문 답변은 저장되지 않습니다.",
  selectedAxes: ["TECH_REGULATION", "REDISTRIBUTION", "TECH_OPTIMISM"] as never[],
  vectorSubset: {
    TECH_REGULATION: 0.8,
    REDISTRIBUTION: 0.6,
    TECH_OPTIMISM: 0.7,
  } as never,
};

const misperceptionCard: ShareCardOutput = {
  type: "MISPERCEPTION",
  privacyDisclaimer: "이 카드는 개인정보 없이 생성됩니다. 원문 답변은 저장되지 않습니다.",
  misperception: {
    dimension: "REDISTRIBUTION" as never,
    userPrediction: 0.3,
    actualBaseline: 0.6,
    gap: 0.3,
    baselineLabel: "20대 한국인 (KGSS 2024)",
  },
};

describe("ShareCardPreview", () => {
  it("renders alias card with label and emoji", () => {
    render(<ShareCardPreview card={aliasCard} onShare={vi.fn()} />);

    expect(screen.getByText("균형 사색가")).toBeInTheDocument();
    expect(screen.getByText("🧭")).toBeInTheDocument();
  });

  it("renders thought map card with axes", () => {
    render(<ShareCardPreview card={thoughtMapCard} onShare={vi.fn()} />);

    expect(screen.getByText(/Thought Map/)).toBeInTheDocument();
  });

  it("renders misperception card with gap data", () => {
    render(<ShareCardPreview card={misperceptionCard} onShare={vi.fn()} />);

    expect(screen.getByText(/KGSS/)).toBeInTheDocument();
  });

  it("shows privacy disclaimer on all cards", () => {
    render(<ShareCardPreview card={aliasCard} onShare={vi.fn()} />);

    expect(screen.getByText(/개인정보/)).toBeInTheDocument();
  });

  it("calls onShare when share button is clicked", () => {
    const onShare = vi.fn();
    render(<ShareCardPreview card={aliasCard} onShare={onShare} />);

    fireEvent.click(screen.getByRole("button", { name: /공유/ }));
    expect(onShare).toHaveBeenCalledTimes(1);
  });
});
