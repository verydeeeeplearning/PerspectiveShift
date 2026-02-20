import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TuringTestPanel } from "../TuringTestPanel";

describe("TuringTestPanel", () => {
  it("renders question and choice buttons", () => {
    render(<TuringTestPanel />);
    expect(
      screen.getByText("이 대화 상대는 사람이었을까요, AI였을까요?"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "사람" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI" })).toBeInTheDocument();
  });

  it("shows result after guessing", async () => {
    render(<TuringTestPanel actual="ai" />);
    fireEvent.click(screen.getByRole("button", { name: "AI" }));

    await waitFor(() => {
      expect(screen.getByText(/결과:/)).toBeInTheDocument();
      expect(screen.getByText(/정답/)).toBeInTheDocument();
    });
  });

  it("supports custom submit handler", async () => {
    const onSubmitGuess = vi.fn().mockResolvedValue({
      actual: "human",
      isCorrect: true,
      rewards: [{ type: "correct_human", message: "사람을 정확히 알아봤어요." }],
    });

    render(<TuringTestPanel onSubmitGuess={onSubmitGuess} />);
    fireEvent.click(screen.getByRole("button", { name: "사람" }));

    await waitFor(() => {
      expect(onSubmitGuess).toHaveBeenCalledWith("human");
      expect(screen.getByText(/사람을 정확히 알아봤어요/)).toBeInTheDocument();
    });
  });
});
