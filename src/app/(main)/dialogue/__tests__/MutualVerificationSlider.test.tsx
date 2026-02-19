import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MutualVerificationSlider } from "../_components/MutualVerificationSlider";

describe("MutualVerificationSlider", () => {
  const onSubmit = vi.fn();

  it("shows opponent summary", () => {
    render(
      <MutualVerificationSlider
        summary="AI가 위험하다는 입장"
        onSubmit={onSubmit}
      />,
    );
    expect(screen.getByText(/AI가 위험하다/)).toBeInTheDocument();
  });

  it("shows slider emojis", () => {
    render(<MutualVerificationSlider summary="요약" onSubmit={onSubmit} />);
    expect(screen.getByText(/😐/)).toBeInTheDocument();
    expect(screen.getByText(/😊/)).toBeInTheDocument();
  });

  it("has submit button", () => {
    render(<MutualVerificationSlider summary="요약" onSubmit={onSubmit} />);
    expect(screen.getByRole("button", { name: /확인/ })).toBeInTheDocument();
  });

  it("has correction suggestion link", () => {
    render(<MutualVerificationSlider summary="요약" onSubmit={onSubmit} />);
    expect(screen.getByText(/수정 제안/)).toBeInTheDocument();
  });
});
