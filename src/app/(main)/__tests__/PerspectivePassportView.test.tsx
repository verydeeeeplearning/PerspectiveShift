import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PerspectivePassportView from "../_components/PerspectivePassportView";

describe("PerspectivePassportView", () => {
  it("renders weekly and total counts", () => {
    render(
      <PerspectivePassportView
        weeklyExploredCount={3}
        totalExploredCount={15}
        discoveredConcepts={[]}
      />,
    );
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("15")).toBeDefined();
  });

  it("renders discovered concepts", () => {
    render(
      <PerspectivePassportView
        weeklyExploredCount={1}
        totalExploredCount={5}
        discoveredConcepts={["외부 비용", "기회 비용"]}
      />,
    );
    expect(screen.getByText("외부 비용")).toBeDefined();
    expect(screen.getByText("기회 비용")).toBeDefined();
  });
});
