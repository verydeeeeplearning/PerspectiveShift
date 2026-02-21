import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ModeSelector } from "../components/ModeSelector";

describe("ModeSelector", () => {
  const onSelect = vi.fn();

  it("renders four mode cards", () => {
    render(<ModeSelector onSelect={onSelect} />);

    expect(screen.getByText("라이트")).toBeInTheDocument();
    expect(screen.getByText("표준 분석")).toBeInTheDocument();
    expect(screen.getByText("심층 분석")).toBeInTheDocument();
    expect(screen.getByText("종합 분석")).toBeInTheDocument();
  });

  it("shows question counts for each mode", () => {
    render(<ModeSelector onSelect={onSelect} />);

    expect(screen.getAllByText(/10문항/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/20문항/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/30문항/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/50문항/).length).toBeGreaterThanOrEqual(1);
  });

  it("shows estimated time for each mode", () => {
    render(<ModeSelector onSelect={onSelect} />);

    expect(screen.getByText(/약 3분/)).toBeInTheDocument();
    expect(screen.getByText(/약 7분/)).toBeInTheDocument();
    expect(screen.getByText(/약 12분/)).toBeInTheDocument();
    expect(screen.getByText(/약 20분/)).toBeInTheDocument();
  });

  it("marks STANDARD as recommended", () => {
    render(<ModeSelector onSelect={onSelect} />);

    expect(screen.getByText("추천")).toBeInTheDocument();
  });

  it("calls onSelect with LITE when lite card is clicked", () => {
    render(<ModeSelector onSelect={onSelect} />);

    fireEvent.click(screen.getByText("라이트"));
    expect(onSelect).toHaveBeenCalledWith("LITE");
  });

  it("calls onSelect with STANDARD when standard card is clicked", () => {
    render(<ModeSelector onSelect={onSelect} />);

    fireEvent.click(screen.getByText("표준 분석"));
    expect(onSelect).toHaveBeenCalledWith("STANDARD");
  });

  it("calls onSelect with COMPREHENSIVE when comprehensive card is clicked", () => {
    render(<ModeSelector onSelect={onSelect} />);

    fireEvent.click(screen.getByText("종합 분석"));
    expect(onSelect).toHaveBeenCalledWith("COMPREHENSIVE");
  });

  it("shows matching quality framing for COMPREHENSIVE mode", () => {
    render(<ModeSelector onSelect={onSelect} />);

    expect(
      screen.getByText(/매칭 품질이 향상됩니다/),
    ).toBeInTheDocument();
  });

  it("renders all cards as buttons for accessibility", () => {
    render(<ModeSelector onSelect={onSelect} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });
});
