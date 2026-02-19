import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SwitchSidesForm } from "../SwitchSidesForm";

describe("SwitchSidesForm", () => {
  it("renders perspective input", () => {
    render(<SwitchSidesForm sessionId="lp-1" onSubmit={vi.fn()} />);
    expect(
      screen.getByLabelText("상대의 관점에서 본 나의 주장"),
    ).toBeInTheDocument();
  });

  it("disables submit when empty", () => {
    render(<SwitchSidesForm sessionId="lp-1" onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: "제출하기" })).toBeDisabled();
  });

  it("enables submit when filled", () => {
    render(<SwitchSidesForm sessionId="lp-1" onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("상대의 관점에서 본 나의 주장"), {
      target: { value: "From their view..." },
    });
    expect(screen.getByRole("button", { name: "제출하기" })).not.toBeDisabled();
  });

  it("calls onSubmit with switched perspective", () => {
    const onSubmit = vi.fn();
    render(<SwitchSidesForm sessionId="lp-1" onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText("상대의 관점에서 본 나의 주장"), {
      target: { value: "From their view..." },
    });
    fireEvent.submit(screen.getByRole("form"));
    expect(onSubmit).toHaveBeenCalledWith({
      switchedPerspective: "From their view...",
    });
  });
});
