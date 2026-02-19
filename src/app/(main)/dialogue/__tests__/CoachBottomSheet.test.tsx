import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CoachBottomSheet } from "../_components/CoachBottomSheet";

describe("CoachBottomSheet", () => {
  const onSelect = vi.fn();
  const onClose = vi.fn();

  it("renders 3 coach suggestion options when open", () => {
    render(<CoachBottomSheet open={true} onSelect={onSelect} onClose={onClose} />);
    const buttons = screen.getAllByRole("button");
    // 3 suggestions + 1 close button
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it("shows method labels", () => {
    render(<CoachBottomSheet open={true} onSelect={onSelect} onClose={onClose} />);
    expect(screen.getByText(/입장부터/)).toBeInTheDocument();
    expect(screen.getByText(/경험부터/)).toBeInTheDocument();
    expect(screen.getByText(/질문부터/)).toBeInTheDocument();
  });

  it("calls onSelect with template when option clicked", () => {
    render(<CoachBottomSheet open={true} onSelect={onSelect} onClose={onClose} />);
    fireEvent.click(screen.getByText(/입장부터/));
    expect(onSelect).toHaveBeenCalledWith(expect.stringContaining("생각합니다"));
  });

  it("does not render when closed", () => {
    const { container } = render(
      <CoachBottomSheet open={false} onSelect={onSelect} onClose={onClose} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("has dialog role when open", () => {
    render(<CoachBottomSheet open={true} onSelect={onSelect} onClose={onClose} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows title text", () => {
    render(<CoachBottomSheet open={true} onSelect={onSelect} onClose={onClose} />);
    expect(screen.getByText(/어떻게 시작할까요/)).toBeInTheDocument();
  });
});
