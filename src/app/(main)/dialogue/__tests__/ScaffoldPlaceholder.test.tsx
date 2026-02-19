import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ScaffoldPlaceholder } from "../_components/ScaffoldPlaceholder";

describe("ScaffoldPlaceholder", () => {
  it("shows placeholder text for POSITION step", () => {
    render(<ScaffoldPlaceholder step="POSITION" />);
    expect(screen.getByText(/____/)).toBeInTheDocument();
  });

  it("shows placeholder text for QUESTION step", () => {
    render(<ScaffoldPlaceholder step="QUESTION" />);
    expect(screen.getByText(/____/)).toBeInTheDocument();
  });

  it("renders nothing for AFFIRMATION step", () => {
    const { container } = render(<ScaffoldPlaceholder step="AFFIRMATION" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing for REFLECTION step", () => {
    const { container } = render(<ScaffoldPlaceholder step="REFLECTION" />);
    expect(container.firstChild).toBeNull();
  });

  it("has translucent styling", () => {
    render(<ScaffoldPlaceholder step="POSITION" />);
    const el = screen.getByText(/____/);
    expect(el.className).toContain("text-gray");
  });
});
