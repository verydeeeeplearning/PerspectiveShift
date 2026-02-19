import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SecondaryButton } from "../SecondaryButton";

describe("SecondaryButton", () => {
  it("renders children text", () => {
    render(<SecondaryButton>건너뛰기</SecondaryButton>);
    expect(screen.getByRole("button", { name: "건너뛰기" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<SecondaryButton onClick={onClick}>Click</SecondaryButton>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is true", () => {
    render(<SecondaryButton disabled>Disabled</SecondaryButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("has transparent background", () => {
    render(<SecondaryButton>Transparent</SecondaryButton>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-transparent");
  });

  it("applies pill border radius", () => {
    render(<SecondaryButton>Pill</SecondaryButton>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("rounded-pill");
  });
});
