import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ToneSuggestionCard } from "../_components/ToneSuggestionCard";

describe("ToneSuggestionCard", () => {
  const onUseSuggestion = vi.fn();
  const onSendOriginal = vi.fn();

  it("shows original and suggested text", () => {
    render(
      <ToneSuggestionCard
        originalText="공격적 표현"
        suggestedText="부드러운 표현"
        onUseSuggestion={onUseSuggestion}
        onSendOriginal={onSendOriginal}
      />,
    );
    expect(screen.getByText(/공격적 표현/)).toBeInTheDocument();
    expect(screen.getByText(/부드러운 표현/)).toBeInTheDocument();
  });

  it("shows suggestion framing text", () => {
    render(
      <ToneSuggestionCard
        originalText="원본"
        suggestedText="대안"
        onUseSuggestion={onUseSuggestion}
        onSendOriginal={onSendOriginal}
      />,
    );
    expect(screen.getByText(/제안/)).toBeInTheDocument();
  });

  it("calls onUseSuggestion when use button clicked", () => {
    render(
      <ToneSuggestionCard
        originalText="원본"
        suggestedText="대안"
        onUseSuggestion={onUseSuggestion}
        onSendOriginal={onSendOriginal}
      />,
    );
    fireEvent.click(screen.getByText(/이 표현 사용하기/));
    expect(onUseSuggestion).toHaveBeenCalled();
  });

  it("calls onSendOriginal when original button clicked", () => {
    render(
      <ToneSuggestionCard
        originalText="원본"
        suggestedText="대안"
        onUseSuggestion={onUseSuggestion}
        onSendOriginal={onSendOriginal}
      />,
    );
    fireEvent.click(screen.getByText(/원래대로 보내기/));
    expect(onSendOriginal).toHaveBeenCalled();
  });

  it("always shows both buttons (autonomy)", () => {
    render(
      <ToneSuggestionCard
        originalText="원본"
        suggestedText="대안"
        onUseSuggestion={onUseSuggestion}
        onSendOriginal={onSendOriginal}
      />,
    );
    expect(screen.getByText(/이 표현 사용하기/)).toBeInTheDocument();
    expect(screen.getByText(/원래대로 보내기/)).toBeInTheDocument();
  });
});
