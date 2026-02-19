import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CommonGroundCard } from "../_components/CommonGroundCard";

describe("CommonGroundCard", () => {
  const onSubmit = vi.fn();

  it("shows most convincing point input", () => {
    render(<CommonGroundCard onSubmit={onSubmit} />);
    expect(screen.getByText(/설득력 있었던 부분/)).toBeInTheDocument();
  });

  it("shows next question input", () => {
    render(<CommonGroundCard onSubmit={onSubmit} />);
    expect(screen.getByText(/다음엔.*묻고 싶다/)).toBeInTheDocument();
  });

  it("has submit button", () => {
    render(<CommonGroundCard onSubmit={onSubmit} />);
    expect(screen.getByRole("button", { name: /완료/ })).toBeInTheDocument();
  });

  it("has two text inputs", () => {
    render(<CommonGroundCard onSubmit={onSubmit} />);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(2);
  });
});
