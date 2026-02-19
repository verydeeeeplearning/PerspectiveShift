import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MicrocopyBanner from "../MicrocopyBanner";

describe("MicrocopyBanner", () => {
  it("renders microcopy text", () => {
    render(<MicrocopyBanner text="설득이 아니라, 이해가 목표예요." tone="safety" />);
    expect(screen.getByText("설득이 아니라, 이해가 목표예요.")).toBeDefined();
  });

  it("applies tone-specific styling", () => {
    render(<MicrocopyBanner text="가볍게 5분만" tone="autonomy" />);
    const el = screen.getByRole("status");
    expect(el.className).toContain("blue");
  });
});
