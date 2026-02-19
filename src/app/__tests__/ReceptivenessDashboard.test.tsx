import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReceptivenessDashboard } from "../_components/ReceptivenessDashboard";

describe("ReceptivenessDashboard", () => {
  it("renders title", () => {
    render(
      <ReceptivenessDashboard
        totalPoints={30}
        templateAdoptions={3}
        feelHeardReceived={2}
        percentile={20}
      />,
    );
    expect(screen.getByText("수용성 대시보드")).toBeDefined();
  });

  it("displays percentile message", () => {
    render(
      <ReceptivenessDashboard
        totalPoints={30}
        templateAdoptions={3}
        feelHeardReceived={2}
        percentile={20}
      />,
    );
    expect(screen.getByText("당신의 대화 수용성이 상위 20%입니다")).toBeDefined();
  });

  it("displays stats", () => {
    render(
      <ReceptivenessDashboard
        totalPoints={45}
        templateAdoptions={5}
        feelHeardReceived={3}
        percentile={null}
      />,
    );
    expect(screen.getByText("45")).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
  });

  it("hides percentile when null", () => {
    render(
      <ReceptivenessDashboard
        totalPoints={0}
        templateAdoptions={0}
        feelHeardReceived={0}
        percentile={null}
      />,
    );
    expect(screen.queryByText(/상위/)).toBeNull();
  });
});
