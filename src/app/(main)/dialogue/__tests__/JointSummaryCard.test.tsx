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

  // --- v4 P0-D2: Enhanced JointSummaryCard rendering ---

  describe("v4 enhanced layout", () => {
    const enhancedSummary: JointSummaryOutput = {
      sessionId: "sess-2",
      agreedPoints: ["환경 보호 중요"],
      disagreedPoints: ["원전 방식"],
      sharedQuestions: ["에너지 믹스?"],
      llmGenerated: true,
      topic: "에너지 정책",
      date: "2026-02-19",
      myKeyPoint: "신재생 에너지 확대",
      opponentKeyPoint: "원전이 현실적",
      commonGround: "탄소 감축 필요",
      newDiscovery: "원전 안전성 개선됨",
      understandingScore: 0.8,
      feelHeardScore: 4,
      autoSaved: true,
    };

    it("renders topic when provided", () => {
      render(<JointSummaryCard summary={enhancedSummary} />);
      expect(screen.getByText(/에너지 정책/)).toBeDefined();
    });

    it("renders date when provided", () => {
      render(<JointSummaryCard summary={enhancedSummary} />);
      expect(screen.getByText(/2026-02-19/)).toBeDefined();
    });

    it("renders my key point", () => {
      render(<JointSummaryCard summary={enhancedSummary} />);
      expect(screen.getByText(/신재생 에너지 확대/)).toBeDefined();
    });

    it("renders opponent key point", () => {
      render(<JointSummaryCard summary={enhancedSummary} />);
      expect(screen.getByText(/원전이 현실적/)).toBeDefined();
    });

    it("renders common ground", () => {
      render(<JointSummaryCard summary={enhancedSummary} />);
      expect(screen.getByText(/탄소 감축 필요/)).toBeDefined();
    });

    it("renders new discovery", () => {
      render(<JointSummaryCard summary={enhancedSummary} />);
      expect(screen.getByText(/원전 안전성 개선됨/)).toBeDefined();
    });

    it("renders understanding score", () => {
      render(<JointSummaryCard summary={enhancedSummary} />);
      expect(screen.getByText(/0.8/)).toBeDefined();
    });

    it("renders feel heard score", () => {
      render(<JointSummaryCard summary={enhancedSummary} />);
      expect(screen.getByText(/4\/5/)).toBeDefined();
    });

    it("renders auto-saved indicator", () => {
      render(<JointSummaryCard summary={enhancedSummary} />);
      expect(screen.getByText(/자동 저장됨/)).toBeDefined();
    });

    it("renders share button", () => {
      render(<JointSummaryCard summary={enhancedSummary} />);
      expect(screen.getByRole("button", { name: /공유하기/ })).toBeDefined();
    });

    it("does not render enhanced sections when fields are missing", () => {
      render(<JointSummaryCard summary={mockSummary} />);
      // Should not crash and should not show enhanced sections
      expect(screen.queryByText(/나의 핵심 주장/)).toBeNull();
      expect(screen.queryByText(/상대의 핵심 주장/)).toBeNull();
      expect(screen.queryByText(/자동 저장됨/)).toBeNull();
    });

    it("does not render common ground when null", () => {
      const noCommonGround: JointSummaryOutput = {
        ...enhancedSummary,
        commonGround: undefined,
        newDiscovery: undefined,
      };
      render(<JointSummaryCard summary={noCommonGround} />);
      expect(screen.queryByText(/공통점/)).toBeNull();
      expect(screen.queryByText(/새로운 발견/)).toBeNull();
    });
  });
});
