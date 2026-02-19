import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PrecisionSelector } from "../components/PrecisionSelector";

describe("PrecisionSelector", () => {
  it("renders quick/standard/detailed cards", () => {
    render(<PrecisionSelector onSelect={vi.fn()} />);

    expect(screen.getByText("빠르게 시작")).toBeInTheDocument();
    expect(screen.getByText("표준 분석")).toBeInTheDocument();
    expect(screen.getByText("정밀 분석")).toBeInTheDocument();
  });

  it("shows question counts and estimated time", () => {
    render(<PrecisionSelector onSelect={vi.fn()} />);

    expect(screen.getByText(/5문항 · 약 2분/)).toBeInTheDocument();
    expect(screen.getByText(/10문항 · 약 4분/)).toBeInTheDocument();
    expect(screen.getByText(/20문항 · 약 9분/)).toBeInTheDocument();
  });

  it("calls onSelect with precision key", () => {
    const onSelect = vi.fn();
    render(<PrecisionSelector onSelect={onSelect} />);

    fireEvent.click(screen.getByText("정밀 분석"));
    expect(onSelect).toHaveBeenCalledWith("detailed");
  });

  it("renders close button when onClose is provided", () => {
    const onClose = vi.fn();
    render(<PrecisionSelector onSelect={vi.fn()} onClose={onClose} />);

    fireEvent.click(screen.getByText("취소"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
