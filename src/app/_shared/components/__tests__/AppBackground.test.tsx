import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppBackground } from "../AppBackground";

describe("AppBackground", () => {
  it("renders children", () => {
    render(
      <AppBackground>
        <p>Hello</p>
      </AppBackground>,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("applies paper variant by default", () => {
    const { container } = render(
      <AppBackground>content</AppBackground>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("bg-paper");
  });

  it("applies paperWarm variant", () => {
    const { container } = render(
      <AppBackground variant="paperWarm">content</AppBackground>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("bg-paper-warm");
  });

  it("renders noise overlay with aria-hidden", () => {
    const { container } = render(
      <AppBackground>content</AppBackground>,
    );
    const noiseOverlay = container.querySelector("[aria-hidden='true']");
    expect(noiseOverlay).toBeInTheDocument();
  });

  it("renders vignette overlay only for paperVignette variant", () => {
    const { container, rerender } = render(
      <AppBackground variant="paper">content</AppBackground>,
    );
    const overlays = container.querySelectorAll("[aria-hidden='true']");
    expect(overlays).toHaveLength(1); // noise only

    rerender(<AppBackground variant="paperVignette">content</AppBackground>);
    const overlaysAfter = container.querySelectorAll("[aria-hidden='true']");
    expect(overlaysAfter).toHaveLength(2); // noise + vignette
  });
});
