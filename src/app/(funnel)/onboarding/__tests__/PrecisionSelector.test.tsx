import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PrecisionSelector } from "../components/PrecisionSelector";

describe("PrecisionSelector", () => {
  it("renders lite/standard/deep/comprehensive cards", () => {
    render(<PrecisionSelector onSelect={vi.fn()} />);

    expect(screen.getByText("라이트")).toBeInTheDocument();
    expect(screen.getByText("표준 분석")).toBeInTheDocument();
    expect(screen.getByText("심층 분석")).toBeInTheDocument();
    expect(screen.getByText("종합 분석")).toBeInTheDocument();
  });

  it("shows question counts and estimated time", () => {
    render(<PrecisionSelector onSelect={vi.fn()} />);

    expect(screen.getByText(/10문항 · 약 3분/)).toBeInTheDocument();
    expect(screen.getByText(/20문항 · 약 7분/)).toBeInTheDocument();
    expect(screen.getByText(/30문항 · 약 12분/)).toBeInTheDocument();
    expect(screen.getByText(/50문항 · 약 20분/)).toBeInTheDocument();
  });

  it("calls onSelect with precision key", () => {
    const onSelect = vi.fn();
    render(<PrecisionSelector onSelect={onSelect} />);

    fireEvent.click(screen.getByText("심층 분석"));
    expect(onSelect).toHaveBeenCalledWith("deep");
  });

  it("renders close button when onClose is provided", () => {
    const onClose = vi.fn();
    render(<PrecisionSelector onSelect={vi.fn()} onClose={onClose} />);

    fireEvent.click(screen.getByText("취소"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders quick upsell panel when enabled", () => {
    const onUpgrade = vi.fn();
    const onKeep = vi.fn();
    render(
      <PrecisionSelector
        onSelect={vi.fn()}
        showQuickUpsell
        onQuickUpsellUpgrade={onUpgrade}
        onQuickUpsellKeepQuick={onKeep}
      />,
    );

    expect(screen.getByText("더 정확한 결과를 원하시면?")).toBeInTheDocument();
    fireEvent.click(screen.getByText("10문항 더 할래요"));
    expect(onUpgrade).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByText("지금 결과 보기"));
    expect(onKeep).toHaveBeenCalledOnce();
  });
});
