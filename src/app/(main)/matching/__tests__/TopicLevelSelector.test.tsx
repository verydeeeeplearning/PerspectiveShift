import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TopicLevelSelector } from "../_components/TopicLevelSelector";

describe("TopicLevelSelector", () => {
  it("renders the prompt question", () => {
    render(
      <TopicLevelSelector selectedLevel={null} onSelect={vi.fn()} />,
    );
    expect(
      screen.getByText("오늘은 어떤 깊이로 대화할까요?"),
    ).toBeDefined();
  });

  it("renders Level 0-2 by default", () => {
    render(
      <TopicLevelSelector selectedLevel={null} onSelect={vi.fn()} />,
    );
    expect(screen.getByText(/일상 가치\/경험/)).toBeDefined();
    expect(screen.getByText(/정책 메커니즘/)).toBeDefined();
    expect(screen.getByText(/가치 충돌/)).toBeDefined();
  });

  it("does not render Level 3 by default", () => {
    render(
      <TopicLevelSelector selectedLevel={null} onSelect={vi.fn()} />,
    );
    expect(screen.queryByText(/정체성 직결/)).toBeNull();
  });

  it("renders Level 3 when maxLevel=3", () => {
    render(
      <TopicLevelSelector
        selectedLevel={null}
        onSelect={vi.fn()}
        maxLevel={3}
      />,
    );
    expect(screen.getByText(/정체성 직결/)).toBeDefined();
  });

  it("calls onSelect when a level is clicked", () => {
    const onSelect = vi.fn();
    render(
      <TopicLevelSelector selectedLevel={null} onSelect={onSelect} />,
    );
    fireEvent.click(screen.getByText(/일상 가치\/경험/).closest("button")!);
    expect(onSelect).toHaveBeenCalledWith(0);
  });

  it("shows first dialogue recommendation", () => {
    render(
      <TopicLevelSelector
        selectedLevel={null}
        onSelect={vi.fn()}
        isFirstDialogue={true}
      />,
    );
    expect(
      screen.getByText(/첫 대화에서는 Level 0-1을 권장합니다/),
    ).toBeDefined();
  });
});
