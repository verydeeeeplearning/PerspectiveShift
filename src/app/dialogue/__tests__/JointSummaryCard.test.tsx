import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { JointSummaryCard } from "../_components/JointSummaryCard";
import type { JointSummaryOutput } from "@/application/dtos/joint-summary-output";

describe("JointSummaryCard", () => {
  const mockSummary: JointSummaryOutput = {
    sessionId: "sess-1",
    agreedPoints: ["안전이 중요하다", "교육이 필요하다"],
    disagreedPoints: ["규제 정도"],
    sharedQuestions: ["어떤 규제가 효과적인가?"],
    llmGenerated: true,
  };

  it("renders title", () => {
    render(<JointSummaryCard summary={mockSummary} />);
    expect(screen.getByText("공동 요약")).toBeDefined();
  });

  it("renders agreed points", () => {
    render(<JointSummaryCard summary={mockSummary} />);
    expect(screen.getByText("안전이 중요하다")).toBeDefined();
    expect(screen.getByText("교육이 필요하다")).toBeDefined();
  });

  it("renders disagreed points", () => {
    render(<JointSummaryCard summary={mockSummary} />);
    expect(screen.getByText("규제 정도")).toBeDefined();
  });

  it("renders shared questions", () => {
    render(<JointSummaryCard summary={mockSummary} />);
    expect(screen.getByText("어떤 규제가 효과적인가?")).toBeDefined();
  });

  it("shows LLM generated notice", () => {
    render(<JointSummaryCard summary={mockSummary} />);
    expect(screen.getByText(/AI가 대화 내용을 기반으로/)).toBeDefined();
  });

  it("shows empty state when no items", () => {
    const emptySummary: JointSummaryOutput = {
      sessionId: "sess-1",
      agreedPoints: [],
      disagreedPoints: [],
      sharedQuestions: [],
      llmGenerated: false,
    };
    render(<JointSummaryCard summary={emptySummary} />);
    expect(screen.getByText("아직 동의 사항이 없습니다")).toBeDefined();
  });
});
