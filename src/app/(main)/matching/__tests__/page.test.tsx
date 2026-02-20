import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MatchCandidateOutput } from "@/application/dtos/match-output";
import MatchingPage from "../page";

const mockApiGet = vi.fn();
const mockApiPost = vi.fn();

vi.mock("@/app/_shared/hooks/useAnonymousSession", () => ({
  useAnonymousSession: () => ({ isReady: true }),
}));

vi.mock("@/app/_shared/api-client", () => ({
  apiGet: (...args: unknown[]) => mockApiGet(...args),
  apiPost: (...args: unknown[]) => mockApiPost(...args),
}));

vi.mock("../components/AiDisclaimerBanner", () => ({
  AiDisclaimerBanner: () => <div data-testid="ai-disclaimer">ai-disclaimer</div>,
}));

vi.mock("../components/AnchorFilterPanel", () => ({
  AnchorFilterPanel: ({
    onApply,
  }: {
    onApply: (payload: {
      anchorType: "age_group";
      anchorValue: string;
      differenceLevel: number;
      appliedRange: { min: number; max: number };
    }) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onApply({
          anchorType: "age_group",
          anchorValue: "30s",
          differenceLevel: 0.5,
          appliedRange: { min: 0, max: 0.5 },
        })
      }
    >
      apply-filter
    </button>
  ),
}));

vi.mock("../components/EnergyReactiveMatchCard", () => ({
  EnergyReactiveMatchCard: ({
    candidate,
    onStart,
    onDecline,
  }: {
    candidate: MatchCandidateOutput | null;
    onStart: () => void;
    onDecline: () => void;
  }) => (
    <section data-testid="featured-card">
      <p>featured:{candidate?.sessionId ?? "none"}</p>
      <button type="button" onClick={onStart}>
        start-featured
      </button>
      <button type="button" onClick={onDecline}>
        decline-featured
      </button>
    </section>
  ),
}));

vi.mock("../components/CandidateList", () => ({
  CandidateList: ({
    candidates,
    onPropose,
  }: {
    candidates: MatchCandidateOutput[];
    onPropose: (candidate: MatchCandidateOutput) => void;
  }) => (
    <div>
      {candidates.map((candidate) => (
        <button
          key={candidate.sessionId}
          type="button"
          onClick={() => onPropose(candidate)}
        >
          start-{candidate.sessionId}
        </button>
      ))}
    </div>
  ),
}));

describe("matching/page", () => {
  beforeEach(() => {
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    window.history.pushState({}, "", "/");
  });

  it("loads unified candidates and renders AI disclaimer", async () => {
    mockApiGet.mockResolvedValue({
      candidates: [
        {
          sessionId: "human-1",
          candidateType: "human",
          distance: 0.22,
          readiness: 0.8,
          score: 0.9,
          inSweetSpot: true,
        },
        {
          sessionId: "agent-persona-1",
          candidateType: "agent",
          personaId: "persona-1",
          distance: 0.25,
          readiness: 0.78,
          score: 0.85,
          inSweetSpot: true,
        },
      ] satisfies MatchCandidateOutput[],
    });

    render(<MatchingPage />);

    expect(await screen.findByText("featured:human-1")).toBeInTheDocument();
    expect(screen.getByTestId("ai-disclaimer")).toBeInTheDocument();
    expect(mockApiGet).toHaveBeenCalledWith("/api/matching/candidates");
  });

  it("creates a proposal for human candidates", async () => {
    mockApiGet.mockResolvedValue({
      candidates: [
        {
          sessionId: "human-1",
          candidateType: "human",
          distance: 0.22,
          readiness: 0.8,
          score: 0.9,
          inSweetSpot: true,
        },
      ] satisfies MatchCandidateOutput[],
    });
    mockApiPost.mockResolvedValue({ id: "proposal-1" });

    render(<MatchingPage />);
    await screen.findByText("featured:human-1");
    fireEvent.click(screen.getByRole("button", { name: "start-featured" }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith("/api/matching/proposals", {
        targetSessionId: "human-1",
      });
    });
  });

  it("creates an agent dialogue session and redirects to dialogue page", async () => {
    mockApiGet.mockResolvedValue({
      candidates: [
        {
          sessionId: "agent-persona-1",
          candidateType: "agent",
          personaId: "persona-1",
          distance: 0.25,
          readiness: 0.78,
          score: 0.85,
          inSweetSpot: true,
        },
      ] satisfies MatchCandidateOutput[],
    });
    mockApiPost.mockResolvedValue({ id: "dialogue-agent-1" });

    render(<MatchingPage />);
    await screen.findByText("featured:agent-persona-1");
    fireEvent.click(screen.getByRole("button", { name: "start-featured" }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith("/api/dialogue/sessions", {
        candidateType: "agent",
        personaId: "persona-1",
      });
      expect(window.location.pathname).toBe("/dialogue/dialogue-agent-1");
    });
  });

  it("applies anchor filter range to candidate list", async () => {
    mockApiGet.mockResolvedValue({
      candidates: [
        {
          sessionId: "human-1",
          candidateType: "human",
          distance: 0.22,
          readiness: 0.8,
          score: 0.9,
          inSweetSpot: true,
        },
        {
          sessionId: "human-2",
          candidateType: "human",
          distance: 0.72,
          readiness: 0.82,
          score: 0.8,
          inSweetSpot: false,
        },
      ] satisfies MatchCandidateOutput[],
    });

    render(<MatchingPage />);

    expect(await screen.findByText("start-human-2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "apply-filter" }));

    await waitFor(() => {
      expect(screen.queryByText("start-human-2")).not.toBeInTheDocument();
    });
  });
});
