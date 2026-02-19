import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ReceptivenessTemplateList } from "../_components/ReceptivenessTemplateList";

describe("ReceptivenessTemplateList", () => {
  const onSelect = vi.fn();

  it("renders template items", () => {
    render(<ReceptivenessTemplateList onSelect={onSelect} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(5);
  });

  it("calls onSelect with template text when clicked", () => {
    render(<ReceptivenessTemplateList onSelect={onSelect} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onSelect).toHaveBeenCalledWith(expect.any(String));
  });

  it("groups templates by category", () => {
    render(<ReceptivenessTemplateList onSelect={onSelect} />);
    expect(screen.getAllByText(/확인/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/공감/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/탐색/).length).toBeGreaterThanOrEqual(1);
  });

  it("shows template text", () => {
    render(<ReceptivenessTemplateList onSelect={onSelect} />);
    expect(screen.getByText(/이해한 게 맞나요/)).toBeInTheDocument();
  });
});
