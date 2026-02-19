import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EnergySelector } from "../components/EnergySelector";

describe("EnergySelector", () => {
  const onSelect = vi.fn();

  it("renders three energy options", () => {
    render(<EnergySelector selected="NORMAL" onSelect={onSelect} />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
  });

  it("shows energy emojis", () => {
    render(<EnergySelector selected="NORMAL" onSelect={onSelect} />);
    expect(screen.getByText("🔋🔋🔋")).toBeInTheDocument();
    expect(screen.getByText("🔋🔋")).toBeInTheDocument();
    expect(screen.getByText("🔋")).toBeInTheDocument();
  });

  it("marks selected option", () => {
    render(<EnergySelector selected="NORMAL" onSelect={onSelect} />);
    const normalButton = screen.getByText("🔋🔋").closest("button");
    expect(normalButton?.className).toContain("border-blue");
    expect(normalButton).toHaveAttribute("aria-checked", "true");
  });

  it("calls onSelect with energy key", () => {
    render(<EnergySelector selected="NORMAL" onSelect={onSelect} />);
    fireEvent.click(screen.getByText("🔋"));
    expect(onSelect).toHaveBeenCalledWith("LOW");
  });

  it("renders energy group as radiogroup", () => {
    render(<EnergySelector selected="NORMAL" onSelect={onSelect} />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });
});
