import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HomeStateView from "../HomeStateView";

describe("HomeStateView", () => {
  it("renders basic state", () => {
    render(<HomeStateView state="FIRST_VISIT" />);
    expect(screen.getByText("생각 지도 만들기")).toBeInTheDocument();
  });

  it("shows last summary in POST_DIALOGUE_D1 state", () => {
    render(
      <HomeStateView
        state="POST_DIALOGUE_D1"
        lastSummary="어제 나눈 핵심 논점은..."
      />,
    );
    expect(screen.getByText("최근 요약")).toBeInTheDocument();
    expect(screen.getByText(/어제 나눈 핵심 논점은/)).toBeInTheDocument();
  });

  it("shows saved questions as start cards", () => {
    render(
      <HomeStateView
        state="POST_DIALOGUE_D1"
        savedQuestions={[
          { id: "q1", text: "왜 그렇게 생각하세요?" },
          { id: "q2", text: "다른 방법은 없을까요?" },
        ]}
      />,
    );
    expect(screen.getByText(/왜 그렇게 생각하세요/)).toBeInTheDocument();
    expect(screen.getByText(/다른 방법은 없을까요/)).toBeInTheDocument();
    expect(screen.getAllByText("이 질문으로 대화 시작")).toHaveLength(2);
  });

  it("does not show summary for other states", () => {
    render(<HomeStateView state="FIRST_VISIT" lastSummary="should not appear" />);
    expect(screen.queryByText("최근 요약")).not.toBeInTheDocument();
  });
});
