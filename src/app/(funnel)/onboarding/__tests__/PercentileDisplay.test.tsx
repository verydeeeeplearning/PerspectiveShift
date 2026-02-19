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

  it("renders percentile info", () => {
    render(<PercentileDisplay percentiles={SAMPLE_PERCENTILES} />);
    expect(screen.getByText("상위 25%")).toBeInTheDocument();
    expect(screen.getByText("상위 40%")).toBeInTheDocument();
  });

  it("renders meter elements with aria labels", () => {
    render(<PercentileDisplay percentiles={SAMPLE_PERCENTILES} />);
    const meters = screen.getAllByRole("meter");
    expect(meters).toHaveLength(2);
  });

  it("shows pole labels", () => {
    render(<PercentileDisplay percentiles={SAMPLE_PERCENTILES} />);
    expect(screen.getByText("자율")).toBeInTheDocument();
    expect(screen.getByText("규제")).toBeInTheDocument();
  });
});
