import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RoleplaySteelmanCard } from "../_components/RoleplaySteelmanCard";

describe("RoleplaySteelmanCard", () => {
  const onComplete = vi.fn();
  const onSkip = vi.fn();

  it("shows roleplay prompt", () => {
    render(
      <RoleplaySteelmanCard
        prompt="AI 일자리 감소 우려론자라면, 내 주장의 가장 약한 부분은:"
        canSkip={true}
        onComplete={onComplete}
        onSkip={onSkip}
      />,
    );
    expect(screen.getByText(/우려론자/)).toBeInTheDocument();
  });

  it("shows 🎭 roleplay icon", () => {
    render(
      <RoleplaySteelmanCard prompt="prompt" canSkip={true} onComplete={onComplete} onSkip={onSkip} />,
    );
    expect(screen.getByText(/🎭/)).toBeInTheDocument();
  });

  it("shows skip button when canSkip is true", () => {
    render(
      <RoleplaySteelmanCard prompt="prompt" canSkip={true} onComplete={onComplete} onSkip={onSkip} />,
    );
    expect(screen.getByText(/건너뛰기/)).toBeInTheDocument();
  });

  it("hides skip button when canSkip is false", () => {
    render(
      <RoleplaySteelmanCard prompt="prompt" canSkip={false} onComplete={onComplete} onSkip={onSkip} />,
    );
    expect(screen.queryByText(/건너뛰기/)).toBeNull();
  });

  it("has text input and complete button", () => {
    render(
      <RoleplaySteelmanCard prompt="prompt" canSkip={true} onComplete={onComplete} onSkip={onSkip} />,
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByText(/작성 완료/)).toBeInTheDocument();
  });
});
