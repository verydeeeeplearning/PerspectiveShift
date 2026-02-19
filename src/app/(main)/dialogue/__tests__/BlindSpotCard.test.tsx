import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BlindSpotCard from "../_components/BlindSpotCard";

describe("BlindSpotCard", () => {
  it("renders discovered concept", () => {
    render(<BlindSpotCard discoveredConcept="외부 비용 내재화" />);
    expect(screen.getByText("외부 비용 내재화")).toBeDefined();
    expect(screen.getByText("오늘의 발견")).toBeDefined();
  });

  it("shows action buttons when callbacks provided", () => {
    const explore = vi.fn();
    const save = vi.fn();
    render(
      <BlindSpotCard
        discoveredConcept="개념"
        onExploreMore={explore}
        onSave={save}
      />,
    );
    fireEvent.click(screen.getByText("이 주제 더 탐색하기"));
    fireEvent.click(screen.getByText("저장"));
    expect(explore).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("hides buttons when no callbacks", () => {
    render(<BlindSpotCard discoveredConcept="개념" />);
    expect(screen.queryByText("이 주제 더 탐색하기")).toBeNull();
    expect(screen.queryByText("저장")).toBeNull();
  });
});
