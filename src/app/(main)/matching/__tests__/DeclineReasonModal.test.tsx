import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DeclineReasonModal } from "../components/DeclineReasonModal";

describe("DeclineReasonModal", () => {
  const onSelect = vi.fn();
  const onClose = vi.fn();

  it("renders 4 decline reason options", () => {
    render(<DeclineReasonModal open={true} onSelect={onSelect} onClose={onClose} />);
    const buttons = screen.getAllByRole("button");
    // 4 reasons + 1 close button
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it("shows reason labels", () => {
    render(<DeclineReasonModal open={true} onSelect={onSelect} onClose={onClose} />);
    expect(screen.getByText(/주제가 무거워요/)).toBeInTheDocument();
    expect(screen.getByText(/시간이 없어요/)).toBeInTheDocument();
    expect(screen.getByText(/쉬고 싶어요/)).toBeInTheDocument();
    expect(screen.getByText(/다른 주제/)).toBeInTheDocument();
  });

  it("calls onSelect with reason key when option clicked", () => {
    render(<DeclineReasonModal open={true} onSelect={onSelect} onClose={onClose} />);
    fireEvent.click(screen.getByText(/시간이 없어요/));
    expect(onSelect).toHaveBeenCalledWith("NO_TIME");
  });

  it("does not render when closed", () => {
    const { container } = render(
      <DeclineReasonModal open={false} onSelect={onSelect} onClose={onClose} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("has dialog role when open", () => {
    render(<DeclineReasonModal open={true} onSelect={onSelect} onClose={onClose} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
