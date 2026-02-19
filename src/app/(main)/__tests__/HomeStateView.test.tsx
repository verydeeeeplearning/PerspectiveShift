import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomeStateView from "../_components/HomeStateView";

describe("HomeStateView", () => {
  it("renders FIRST_VISIT state", () => {
    render(<HomeStateView state="FIRST_VISIT" />);
    expect(screen.getByText("생각 지도 만들기")).toBeDefined();
    expect(screen.getByText("시작하기")).toBeDefined();
  });

  it("renders POST_DIALOGUE_D1 state", () => {
    render(<HomeStateView state="POST_DIALOGUE_D1" />);
    expect(screen.getByText("어제 대화 돌아보기")).toBeDefined();
  });

  it("renders RETURNING_AFTER_14D state", () => {
    render(<HomeStateView state="RETURNING_AFTER_14D" />);
    expect(screen.getByText("오랜만이에요!")).toBeDefined();
  });
});
