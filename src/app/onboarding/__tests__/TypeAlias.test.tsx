import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TypeAlias } from "../components/TypeAlias";
import type { MapTypeOutput } from "@/application/dtos/thought-map-output";

const SAMPLE_TYPE: MapTypeOutput = {
  name: "BALANCE_SEEKER",
  alias: "균형 탐색가",
  emoji: "\u2696\uFE0F",
  description: "다양한 관점을 균형 있게 고려합니다.",
};

describe("TypeAlias", () => {
  it("renders alias name", () => {
    render(<TypeAlias mapType={SAMPLE_TYPE} />);
    expect(screen.getByText("균형 탐색가")).toBeInTheDocument();
  });

  it("renders emoji", () => {
    render(<TypeAlias mapType={SAMPLE_TYPE} />);
    expect(screen.getByRole("img", { name: "균형 탐색가" })).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<TypeAlias mapType={SAMPLE_TYPE} />);
    expect(
      screen.getByText("다양한 관점을 균형 있게 고려합니다."),
    ).toBeInTheDocument();
  });
});
