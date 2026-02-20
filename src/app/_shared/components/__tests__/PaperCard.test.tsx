import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PaperCard } from "../PaperCard";

describe("PaperCard", () => {
  it("renders children", () => {
    render(<PaperCard>Card content</PaperCard>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("applies default variant styles", () => {
    const { container } = render(<PaperCard>Default</PaperCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("bg-surface-card");
    expect(card.className).toContain("shadow-paper");
  });

  it("applies elevated variant with shadow-card", () => {
    const { container } = render(
      <PaperCard variant="elevated">Elevated</PaperCard>,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("shadow-card");
  });

  it("applies selected variant with 2px indigo border", () => {
    const { container } = render(
      <PaperCard variant="selected">Selected</PaperCard>,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("border-2");
    expect(card.className).toContain("border-indigo-depth");
  });

  it("applies semantic variant with similarity accent", () => {
    const { container } = render(
      <PaperCard variant="semantic" semanticAccent="similarity">
        Semantic
      </PaperCard>,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("border-l-semantic-similarity");
  });

  it("applies semantic variant with difference accent", () => {
    const { container } = render(
      <PaperCard variant="semantic" semanticAccent="difference">
        Diff
      </PaperCard>,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("border-l-semantic-difference");
  });

  it("applies interactive variant with cursor-pointer and motion", () => {
    const { container } = render(
      <PaperCard variant="interactive">Interactive</PaperCard>,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("cursor-pointer");
    // Interactive variant now uses Framer Motion for hover/tap animations
    // instead of CSS hover:shadow-card
    expect(card.className).toContain("bg-surface-card");
  });

  it("uses compact padding (p-4) by default", () => {
    const { container } = render(<PaperCard>Compact</PaperCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("p-4");
  });

  it("uses spacious padding (p-6) when specified", () => {
    const { container } = render(
      <PaperCard padding="spacious">Spacious</PaperCard>,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("p-6");
  });

  it("uses card border radius", () => {
    const { container } = render(<PaperCard>Radius</PaperCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("rounded-card");
  });
});
