import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PercentileDisplay } from "../components/PercentileDisplay";
import type { PercentileOutput } from "@/application/dtos/thought-map-output";

const SAMPLE_PERCENTILES: PercentileOutput[] = [
  {
    dimension: "TECH_REGULATION",
    label: "기술 규제",
    percentile: 75,
    value: 0.5,
  },
  {
    dimension: "REDISTRIBUTION",
    label: "소득 재분배",
    percentile: 60,
    value: 0.3,
  },
];

describe("PercentileDisplay", () => {
  it("renders all dimension labels", () => {
    render(<PercentileDisplay percentiles={SAMPLE_PERCENTILES} />);
    expect(screen.getByText("기술 규제")).toBeInTheDocument();
    expect(screen.getByText("소득 재분배")).toBeInTheDocument();
  });

  it("renders spectrum text with pole direction", () => {
    render(<PercentileDisplay percentiles={SAMPLE_PERCENTILES} />);
    expect(screen.getByText("규제 쪽 25%")).toBeInTheDocument();
    expect(screen.getByText("복지 쪽 10%")).toBeInTheDocument();
  });

  it("renders meter elements with aria labels", () => {
    render(<PercentileDisplay percentiles={SAMPLE_PERCENTILES} />);
    const meters = screen.getAllByRole("meter");
    expect(meters).toHaveLength(2);
  });

  it("shows pole labels and center label", () => {
    render(<PercentileDisplay percentiles={SAMPLE_PERCENTILES} />);
    expect(screen.getByText("자율")).toBeInTheDocument();
    expect(screen.getByText("규제")).toBeInTheDocument();
  });

  it("shows '중앙' for percentiles near 50", () => {
    const centerPercentiles: PercentileOutput[] = [
      {
        dimension: "TECH_REGULATION",
        label: "기술 규제",
        percentile: 51,
        value: 0.02,
      },
    ];
    render(<PercentileDisplay percentiles={centerPercentiles} />);
    const spectrumTexts = screen.getAllByText("중앙");
    expect(spectrumTexts.length).toBeGreaterThanOrEqual(1);
  });

  it("renders section title as 가치관 스펙트럼", () => {
    render(<PercentileDisplay percentiles={SAMPLE_PERCENTILES} />);
    expect(screen.getByText("가치관 스펙트럼")).toBeInTheDocument();
  });
});
