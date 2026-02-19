import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DailyLimitNotice } from "../_components/DailyLimitNotice";

describe("DailyLimitNotice", () => {
  it("shows remaining count when partially used", () => {
    render(<DailyLimitNotice remaining={1} maxDaily={2} />);
    expect(screen.getByText(/1회/)).toBeDefined();
  });

  it("shows exhausted message when 0 remaining", () => {
    render(<DailyLimitNotice remaining={0} maxDaily={2} />);
    expect(screen.getByText(/모두 사용했어요/)).toBeDefined();
  });

  it("renders nothing when fully available", () => {
    const { container } = render(<DailyLimitNotice remaining={2} maxDaily={2} />);
    expect(container.innerHTML).toBe("");
  });
});
