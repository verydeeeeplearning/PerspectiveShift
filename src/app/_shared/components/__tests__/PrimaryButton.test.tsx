import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PrimaryButton } from "../PrimaryButton";

describe("PrimaryButton", () => {
  it("renders children text", () => {
    render(<PrimaryButton>대화 찾기</PrimaryButton>);
    expect(screen.getByRole("button", { name: "대화 찾기" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<PrimaryButton onClick={onClick}>Click</PrimaryButton>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is true", () => {
    render(<PrimaryButton disabled>Disabled</PrimaryButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when loading", () => {
    render(<PrimaryButton loading>Loading</PrimaryButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows loading dots when loading", () => {
    render(<PrimaryButton loading>Loading</PrimaryButton>);
    expect(screen.getByLabelText("로딩 중")).toBeInTheDocument();
  });

  it("does not show loading dots when not loading", () => {
    render(<PrimaryButton>Normal</PrimaryButton>);
    expect(screen.queryByLabelText("로딩 중")).not.toBeInTheDocument();
  });

  it("applies fullWidth class when fullWidth is true", () => {
    render(<PrimaryButton fullWidth>Full</PrimaryButton>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("w-full");
  });

  it("applies pill border radius when not fullWidth", () => {
    render(<PrimaryButton>Pill</PrimaryButton>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("rounded-pill");
  });

  it("applies card border radius when fullWidth", () => {
    render(<PrimaryButton fullWidth>Full</PrimaryButton>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("rounded-card");
    expect(btn.className).not.toContain("rounded-pill");
  });
});
