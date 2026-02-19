import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AliasCard } from "../components/AliasCard";
import type { AliasOutput } from "@/application/dtos/thought-map-output";

describe("AliasCard", () => {
  const mockAlias: AliasOutput = {
    key: "HOT_DEBATER",
    label: "뜨거운 논객",
    emoji: "\uD83D\uDD25",
    description: "확신이 강하고 분명한 입장을 가지고 있어, 토론에서 빛을 발합니다.",
  };

  it("renders alias label", () => {
    render(<AliasCard alias={mockAlias} />);
    expect(screen.getByText("뜨거운 논객")).toBeDefined();
  });

  it("renders alias emoji", () => {
    render(<AliasCard alias={mockAlias} />);
    expect(screen.getByRole("img", { name: "뜨거운 논객" })).toBeDefined();
  });

  it("renders alias description", () => {
    render(<AliasCard alias={mockAlias} />);
    expect(
      screen.getByText(/확신이 강하고 분명한 입장/),
    ).toBeDefined();
  });

  it("renders different alias", () => {
    const flexibleAlias: AliasOutput = {
      key: "FLEXIBLE_WAVE",
      label: "유연한 물결",
      emoji: "\uD83C\uDF0A",
      description: "상황에 따라 유연하게 생각을 조율하며, 다양한 맥락을 고려합니다.",
    };
    render(<AliasCard alias={flexibleAlias} />);
    expect(screen.getByText("유연한 물결")).toBeDefined();
  });
});
