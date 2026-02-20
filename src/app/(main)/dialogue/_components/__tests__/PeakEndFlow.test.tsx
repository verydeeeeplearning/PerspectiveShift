import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { PeakEndFlow } from "../PeakEndFlow";
import type { FinalCTAContext } from "@/domain/value-objects/final-cta-type";

const defaultSummary = {
  topic: "Topic",
  date: "2026-02-19",
  myKeyPoint: "My position summary",
  opponentKeyPoint: "Opponent position summary",
  commonGround: "Shared point",
  newDiscovery: "New insight",
  understandingScore: 0.7,
  feelHeardScore: 4,
  agreedPoints: ["Shared point"],
  disagreedPoints: ["Different policy"],
};

const defaultGiftMessage = {
  text: "Thanks for explaining your perspective.",
  writtenAtStep: "REFLECTION",
};

const defaultBlindSpot = {
  discoveredConcept: "I focused too much on one metric.",
};

const defaultCtaContext: FinalCTAContext = {
  isAgentDialogue: false,
  feelHeardScore: 50,
  hasHumanMatch: false,
  energyLevel: "NORMAL",
};

const onKPISubmit = vi.fn();
const onNextQuestionSave = vi.fn();
const onCTAClick = vi.fn();

function renderFlow(overrides: Partial<Parameters<typeof PeakEndFlow>[0]> = {}) {
  return render(
    <PeakEndFlow
      summary={defaultSummary}
      giftMessage={defaultGiftMessage}
      blindSpot={defaultBlindSpot}
      ctaContext={defaultCtaContext}
      onKPISubmit={onKPISubmit}
      onNextQuestionSave={onNextQuestionSave}
      onCTAClick={onCTAClick}
      {...overrides}
    />,
  );
}

function clickPrimaryButton(stepTestId: string) {
  const step = screen.getByTestId(stepTestId);
  const button = within(step).getAllByRole("button")[0];
  fireEvent.click(button);
}

function advanceToFinalCta() {
  clickPrimaryButton("step-joint-summary");
  clickPrimaryButton("step-gift-message");
  clickPrimaryButton("step-blind-spot");
  clickPrimaryButton("step-kpi");
  clickPrimaryButton("step-next-question");
}

describe("PeakEndFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders joint summary first", () => {
    renderFlow();
    expect(screen.getByTestId("step-joint-summary")).toBeInTheDocument();
  });

  it("submits KPI values when advancing from KPI step", () => {
    renderFlow();

    clickPrimaryButton("step-joint-summary");
    clickPrimaryButton("step-gift-message");
    clickPrimaryButton("step-blind-spot");
    fireEvent.change(screen.getByLabelText("Feel Heard"), {
      target: { value: "77" },
    });
    clickPrimaryButton("step-kpi");

    expect(onKPISubmit).toHaveBeenCalledWith(77, 50);
  });

  it("saves next question when user enters text", () => {
    renderFlow();

    clickPrimaryButton("step-joint-summary");
    clickPrimaryButton("step-gift-message");
    clickPrimaryButton("step-blind-spot");
    clickPrimaryButton("step-kpi");

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "What evidence would change your mind?" },
    });
    clickPrimaryButton("step-next-question");

    expect(onNextQuestionSave).toHaveBeenCalledWith(
      "What evidence would change your mind?",
    );
  });

  it("uses FIND_NEXT_DIALOGUE CTA by default", () => {
    renderFlow();
    advanceToFinalCta();

    const finalStep = screen.getByTestId("step-final-cta");
    const button = within(finalStep).getByRole("button");
    fireEvent.click(button);

    expect(onCTAClick).toHaveBeenCalledWith("FIND_NEXT_DIALOGUE");
  });

  it("uses BECOME_FRIENDS when feelHeard is high for human dialogue", () => {
    renderFlow({
      ctaContext: { ...defaultCtaContext, feelHeardScore: 85 },
    });
    advanceToFinalCta();

    const finalStep = screen.getByTestId("step-final-cta");
    fireEvent.click(within(finalStep).getByRole("button"));

    expect(onCTAClick).toHaveBeenCalledWith("BECOME_FRIENDS");
  });

  it("uses REST_FOR_TODAY when energy is LOW", () => {
    renderFlow({
      ctaContext: { ...defaultCtaContext, energyLevel: "LOW" },
    });
    advanceToFinalCta();

    const finalStep = screen.getByTestId("step-final-cta");
    fireEvent.click(within(finalStep).getByRole("button"));

    expect(onCTAClick).toHaveBeenCalledWith("REST_FOR_TODAY");
  });

  it("shows TURING_TEST step for agent dialogue", () => {
    renderFlow({
      ctaContext: { ...defaultCtaContext, isAgentDialogue: true },
    });

    clickPrimaryButton("step-joint-summary");
    clickPrimaryButton("step-gift-message");
    clickPrimaryButton("step-blind-spot");
    clickPrimaryButton("step-kpi");

    expect(screen.getByTestId("step-turing")).toBeInTheDocument();
  });

  it("does not render legacy CTA copy after final step", () => {
    renderFlow();
    advanceToFinalCta();

    expect(
      screen.queryByText("\uC2E4\uC81C \uC0AC\uB78C\uACFC \uB300\uD654\uD558\uAE30"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("\uB2E4\uB978 \uD398\uB974\uC18C\uB098"),
    ).not.toBeInTheDocument();
  });
});
