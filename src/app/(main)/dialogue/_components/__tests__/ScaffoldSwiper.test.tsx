import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ScaffoldSwiper } from "../ScaffoldSwiper";

describe("ScaffoldSwiper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the first suggestion card with label and template", () => {
    render(<ScaffoldSwiper />);

    expect(screen.getByText("입장부터 시작하기")).toBeInTheDocument();
    expect(
      screen.getByText("저는 이 주제에 대해 ____ 라고 생각합니다."),
    ).toBeInTheDocument();
  });

  it("renders 3 dot indicators", () => {
    render(<ScaffoldSwiper />);

    const dots = screen.getAllByRole("tab");
    expect(dots).toHaveLength(3);
  });

  it("marks the first dot as selected by default", () => {
    render(<ScaffoldSwiper />);

    const dots = screen.getAllByRole("tab");
    expect(dots[0]).toHaveAttribute("aria-selected", "true");
    expect(dots[1]).toHaveAttribute("aria-selected", "false");
    expect(dots[2]).toHaveAttribute("aria-selected", "false");
  });

  it("navigates to a different card when a dot is clicked", async () => {
    render(<ScaffoldSwiper />);

    const dots = screen.getAllByRole("tab");
    fireEvent.click(dots[1]);

    // Dot updates immediately
    expect(dots[1]).toHaveAttribute("aria-selected", "true");
    // Card content updates after AnimatePresence exit animation
    await waitFor(() => {
      expect(screen.getByText("경험부터 시작하기")).toBeInTheDocument();
    });
  });

  it("navigates to the third card when third dot is clicked", async () => {
    render(<ScaffoldSwiper />);

    const dots = screen.getAllByRole("tab");
    fireEvent.click(dots[2]);

    expect(dots[2]).toHaveAttribute("aria-selected", "true");
    await waitFor(() => {
      expect(screen.getByText("질문부터 시작하기")).toBeInTheDocument();
    });
  });

  it("renders the Coach button", () => {
    render(<ScaffoldSwiper />);

    expect(screen.getByRole("button", { name: "Coach" })).toBeInTheDocument();
  });

  it("fires onCoachClick when Coach button is clicked", () => {
    const onCoachClick = vi.fn();
    render(<ScaffoldSwiper onCoachClick={onCoachClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Coach" }));

    expect(onCoachClick).toHaveBeenCalledTimes(1);
  });

  it("fires onSelect with template when card is clicked", () => {
    const onSelect = vi.fn();
    render(<ScaffoldSwiper onSelect={onSelect} />);

    // Click the card (the motion.div with role="button")
    const card = screen.getByRole("button", {
      name: /입장부터 시작하기/,
    });
    fireEvent.click(card);

    expect(onSelect).toHaveBeenCalledWith(
      "저는 이 주제에 대해 ____ 라고 생각합니다.",
    );
  });

  it("dispatches scaffold_select event when card is clicked", () => {
    const handler = vi.fn();
    window.addEventListener("scaffold_select", handler);

    render(<ScaffoldSwiper />);

    const card = screen.getByRole("button", {
      name: /입장부터 시작하기/,
    });
    fireEvent.click(card);

    expect(handler).toHaveBeenCalledTimes(1);

    window.removeEventListener("scaffold_select", handler);
  });

  it("dispatches coach_click event when Coach button is clicked", () => {
    const handler = vi.fn();
    window.addEventListener("coach_click", handler);

    render(<ScaffoldSwiper />);

    fireEvent.click(screen.getByRole("button", { name: "Coach" }));

    expect(handler).toHaveBeenCalledTimes(1);

    window.removeEventListener("coach_click", handler);
  });

  it("dispatches scaffold_swipe event when navigating via dots", () => {
    const handler = vi.fn();
    window.addEventListener("scaffold_swipe", handler);

    render(<ScaffoldSwiper />);

    const dots = screen.getAllByRole("tab");
    fireEvent.click(dots[1]);

    expect(handler).toHaveBeenCalledTimes(1);

    window.removeEventListener("scaffold_swipe", handler);
  });

  it("has accessible card with aria-label", () => {
    render(<ScaffoldSwiper />);

    const card = screen.getByRole("button", {
      name: /입장부터 시작하기.*저는 이 주제에 대해/,
    });
    expect(card).toBeInTheDocument();
  });

  it("has a tablist for dot indicators", () => {
    render(<ScaffoldSwiper />);

    expect(
      screen.getByRole("tablist", { name: "카드 인디케이터" }),
    ).toBeInTheDocument();
  });
});
