import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ModeSelector } from "../components/ModeSelector";

describe("ModeSelector", () => {
  const onSelect = vi.fn();

  it("renders three mode cards", () => {
    render(<ModeSelector onSelect={onSelect} />);

    expect(screen.getByText("빠르게 시작")).toBeInTheDocument();
    expect(screen.getByText("표준 분석")).toBeInTheDocument();
    expect(screen.getByText("정밀 분석")).toBeInTheDocument();
  });

  it("shows question counts for each mode", () => {
    render(<ModeSelector onSelect={onSelect} />);

    expect(screen.getAllByText(/5문항/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/10문항/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/20문항/).length).toBeGreaterThanOrEqual(1);
  });

  it("shows estimated time for each mode", () => {
    render(<ModeSelector onSelect={onSelect} />);

    expect(screen.getByText(/약 2분/)).toBeInTheDocument();
    expect(screen.getByText(/약 4분/)).toBeInTheDocument();
    expect(screen.getByText(/약 9분/)).toBeInTheDocument();
  });

  it("marks QUICK as recommended", () => {
    render(<ModeSelector onSelect={onSelect} />);

    expect(screen.getByText("추천")).toBeInTheDocument();
  });

  it("calls onSelect with mode key when card is clicked", () => {
    render(<ModeSelector onSelect={onSelect} />);

    fireEvent.click(screen.getByText("빠르게 시작"));
    expect(onSelect).toHaveBeenCalledWith("QUICK");
  });

  it("calls onSelect with STANDARD when standard card is clicked", () => {
    render(<ModeSelector onSelect={onSelect} />);

    fireEvent.click(screen.getByText("표준 분석"));
    expect(onSelect).toHaveBeenCalledWith("STANDARD");
  });

  it("calls onSelect with PRECISE when precise card is clicked", () => {
    render(<ModeSelector onSelect={onSelect} />);

    fireEvent.click(screen.getByText("정밀 분석"));
    expect(onSelect).toHaveBeenCalledWith("PRECISE");
  });

  it("shows matching quality framing for PRECISE mode", () => {
    render(<ModeSelector onSelect={onSelect} />);

    expect(
      screen.getByText(/매칭 품질이 향상됩니다/),
    ).toBeInTheDocument();
  });

  it("renders all cards as buttons for accessibility", () => {
    render(<ModeSelector onSelect={onSelect} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });
});
