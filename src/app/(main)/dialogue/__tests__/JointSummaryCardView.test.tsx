import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import JointSummaryCardView from "../_components/JointSummaryCardView";

describe("JointSummaryCardView", () => {
  it("renders agreed and disagreed points", () => {
    render(
      <JointSummaryCardView
        agreedPoints={["환경 보호"]}
        disagreedPoints={["원전 방식"]}
        sharedQuestion={null}
      />,
    );
    expect(screen.getByText("환경 보호")).toBeDefined();
    expect(screen.getByText("원전 방식")).toBeDefined();
  });

  it("renders shared question when provided", () => {
    render(
      <JointSummaryCardView
        agreedPoints={["a"]}
        disagreedPoints={[]}
        sharedQuestion="에너지 믹스?"
      />,
    );
    expect(screen.getByText("에너지 믹스?")).toBeDefined();
  });

  it("hides sections with no items", () => {
    render(
      <JointSummaryCardView
        agreedPoints={[]}
        disagreedPoints={["차이"]}
        sharedQuestion={null}
      />,
    );
    expect(screen.queryByText("우리가 동의한 것")).toBeNull();
    expect(screen.getByText("차이")).toBeDefined();
  });
});
