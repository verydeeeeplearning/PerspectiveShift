import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PrecisionGauge } from "../components/PrecisionGauge";

describe("PrecisionGauge", () => {
  it("renders precision percentage", () => {
    render(
      <PrecisionGauge
        precision={62}
        label="보통"
        onUpgrade={vi.fn()}
      />,
    );

    expect(screen.getByText("62%")).toBeInTheDocument();
  });

  it("renders precision label", () => {
    render(
      <PrecisionGauge
        precision={85}
        label="매우 정밀"
        onUpgrade={vi.fn()}
      />,
    );

    expect(screen.getByText("매우 정밀")).toBeInTheDocument();
  });

  it("has progressbar role", () => {
    render(
      <PrecisionGauge
        precision={62}
        label="보통"
        onUpgrade={vi.fn()}
      />,
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows upgrade CTA when milestone is provided", () => {
    render(
      <PrecisionGauge
        precision={62}
        label="보통"
        nextMilestone={{
          targetQuestions: 10,
          targetPrecision: 75,
          additionalQuestions: 5,
          estimatedMinutes: 3,
        }}
        onUpgrade={vi.fn()}
      />,
    );

    expect(screen.getByText(/정밀도 올리기/)).toBeInTheDocument();
    expect(screen.getByText(/5문항/)).toBeInTheDocument();
  });

  it("hides upgrade CTA when no milestone", () => {
    render(
      <PrecisionGauge
        precision={95}
        label="매우 정밀"
        onUpgrade={vi.fn()}
      />,
    );

    expect(screen.queryByText(/정밀도 올리기/)).not.toBeInTheDocument();
  });

  it("calls onUpgrade when CTA is clicked", () => {
    const onUpgrade = vi.fn();
    render(
      <PrecisionGauge
        precision={62}
        label="보통"
        nextMilestone={{
          targetQuestions: 10,
          targetPrecision: 75,
          additionalQuestions: 5,
          estimatedMinutes: 3,
        }}
        onUpgrade={onUpgrade}
      />,
    );

    fireEvent.click(screen.getByText(/정밀도 올리기/));
    expect(onUpgrade).toHaveBeenCalledTimes(1);
  });

  it("shows estimated time in upgrade CTA", () => {
    render(
      <PrecisionGauge
        precision={62}
        label="보통"
        nextMilestone={{
          targetQuestions: 10,
          targetPrecision: 75,
          additionalQuestions: 5,
          estimatedMinutes: 3,
        }}
        onUpgrade={vi.fn()}
      />,
    );

    expect(screen.getByText(/약 3분/)).toBeInTheDocument();
  });
});
