import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DeclineBadge } from "../components/DeclineBadge";

describe("DeclineBadge", () => {
  it("renders badge text", () => {
    render(<DeclineBadge text="난이도를 낮춰봤어요" />);
    expect(screen.getByText("난이도를 낮춰봤어요")).toBeInTheDocument();
  });

  it('has role="status"', () => {
    render(<DeclineBadge text="조정 완료" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    render(<DeclineBadge text="거리를 좁혀봤어요" />);
    expect(screen.getByLabelText("조정 상태")).toBeInTheDocument();
  });
});
