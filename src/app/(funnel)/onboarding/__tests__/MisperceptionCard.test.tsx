import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MisperceptionCard } from "../components/MisperceptionCard";
import type { MisperceptionOutput } from "@/application/dtos/misperception-output";
import { StanceDimension } from "@/domain/value-objects/stance-dimension";

describe("MisperceptionCard", () => {
  const accurateResult: MisperceptionOutput = {
    dimension: StanceDimension.TECH_REGULATION,
    userPrediction: 0.3,
    actualBaseline: 0.25,
    gap: 0.05,
    gapPercentage: 3,
    isAccurate: true,
  };

  const inaccurateResult: MisperceptionOutput = {
    dimension: StanceDimension.REDISTRIBUTION,
    userPrediction: 0.8,
    actualBaseline: 0.2,
    gap: 0.6,
    gapPercentage: 30,
    isAccurate: false,
  };

  it("renders dimension label in Korean", () => {
    render(<MisperceptionCard result={accurateResult} />);
    expect(screen.getByText("기술 규제")).toBeDefined();
  });

  it("shows '정확' badge when accurate", () => {
    render(<MisperceptionCard result={accurateResult} />);
    expect(screen.getByText("정확")).toBeDefined();
  });

  it("shows '오해' badge when inaccurate", () => {
    render(<MisperceptionCard result={inaccurateResult} />);
    expect(screen.getByText("오해")).toBeDefined();
  });

  it("displays prediction and baseline values", () => {
    render(<MisperceptionCard result={inaccurateResult} />);
    expect(screen.getByText("+0.80")).toBeDefined();
    expect(screen.getByText("+0.20")).toBeDefined();
  });

  it("displays gap percentage", () => {
    render(<MisperceptionCard result={inaccurateResult} />);
    expect(screen.getByText("30%")).toBeDefined();
  });
});
