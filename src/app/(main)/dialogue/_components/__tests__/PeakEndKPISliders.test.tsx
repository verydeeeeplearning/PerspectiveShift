import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import PeakEndKPISliders from "../PeakEndKPISliders";

describe("PeakEndKPISliders", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("auto-saves after 1.5s debounce", () => {
    const onSubmit = vi.fn();
    render(<PeakEndKPISliders onSubmit={onSubmit} />);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(onSubmit).toHaveBeenCalledWith(50, 50, 50);
  });

  it("shows saved indicator after auto-save", () => {
    const onSubmit = vi.fn();
    render(<PeakEndKPISliders onSubmit={onSubmit} />);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText(/저장됨/)).toBeInTheDocument();
  });

  it("resets debounce timer on slider change", () => {
    const onSubmit = vi.fn();
    render(<PeakEndKPISliders onSubmit={onSubmit} />);

    const slider = screen.getByLabelText("Feel Heard 슬라이더");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.change(slider, { target: { value: "80" } });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // Should not have been called yet (timer reset)
    expect(onSubmit).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onSubmit).toHaveBeenCalledWith(80, 50, 50);
  });

  it("renders trailer accuracy slider", () => {
    const onSubmit = vi.fn();
    render(<PeakEndKPISliders onSubmit={onSubmit} />);
    expect(screen.getByLabelText("Trailer 일치도 슬라이더")).toBeInTheDocument();
  });
});
