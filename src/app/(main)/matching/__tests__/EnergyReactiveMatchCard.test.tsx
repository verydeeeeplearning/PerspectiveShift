import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { MatchCandidateOutput } from "@/application/dtos/match-output";
import { EnergyReactiveMatchCard } from "../components/EnergyReactiveMatchCard";

const MOCK_CANDIDATE: MatchCandidateOutput = {
  sessionId: "candidate-1",
  distance: 0.52,
  readiness: 0.82,
  score: 0.74,
  inSweetSpot: true,
};

describe("EnergyReactiveMatchCard", () => {
  it("renders NORMAL defaults with social proof", () => {
    render(
      <EnergyReactiveMatchCard
        candidate={MOCK_CANDIDATE}
        candidateCount={3}
        onStart={vi.fn()}
        onDecline={vi.fn()}
      />,
    );

    expect(screen.getByTestId("match-card-time")).toHaveTextContent("약 10분");
    expect(screen.getByTestId("match-card-difficulty")).toHaveTextContent(
      "난이도 Level 1-2",
    );
    expect(
      screen.getByRole("button", { name: "대화 시작" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("현재 3명의 후보가 준비되어 있어요"),
    ).toBeInTheDocument();
  });

  it("updates metrics and emits events when energy changes", async () => {
    const onEvent = vi.fn();
    render(
      <EnergyReactiveMatchCard
        candidate={MOCK_CANDIDATE}
        candidateCount={2}
        onStart={vi.fn()}
        onDecline={vi.fn()}
        onEvent={onEvent}
      />,
    );

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        "energy_check_select_medium",
        expect.objectContaining({ energy: "NORMAL" }),
      );
    });

    fireEvent.click(screen.getByRole("radio", { name: /낮음/ }));

    await waitFor(() => {
      expect(screen.getByTestId("match-card-time")).toHaveTextContent("약 5분");
      expect(screen.getByTestId("match-card-difficulty")).toHaveTextContent(
        "난이도 Level 0-1",
      );
    });
    expect(
      screen.getByRole("button", { name: "가볍게 5분 시작" }),
    ).toBeInTheDocument();

    expect(onEvent).toHaveBeenCalledWith(
      "energy_check_select_low",
      expect.objectContaining({ energy: "LOW" }),
    );
    expect(onEvent).toHaveBeenCalledWith(
      "energy_check_change",
      expect.objectContaining({
        previousEnergy: "NORMAL",
        nextEnergy: "LOW",
      }),
    );
    expect(onEvent).toHaveBeenCalledWith(
      "matching_card_render_time",
      expect.objectContaining({
        energy: "LOW",
        elapsedMs: expect.any(Number),
      }),
    );
  });

  it("forwards start and decline actions", () => {
    const onStart = vi.fn();
    const onDecline = vi.fn();

    render(
      <EnergyReactiveMatchCard
        candidate={MOCK_CANDIDATE}
        candidateCount={1}
        onStart={onStart}
        onDecline={onDecline}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "대화 시작" }));
    fireEvent.click(screen.getByRole("button", { name: "다음에" }));

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onDecline).toHaveBeenCalledTimes(1);
  });
});
