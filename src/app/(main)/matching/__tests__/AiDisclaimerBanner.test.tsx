import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AiDisclaimerBanner } from "../components/AiDisclaimerBanner";

describe("AiDisclaimerBanner", () => {
  it("renders as a subtle note with AI disclosure text", () => {
    render(<AiDisclaimerBanner />);

    const note = screen.getByRole("note");
    expect(note).toBeInTheDocument();
    expect(note).toHaveClass("text-xs");
    expect(note).toHaveClass("text-text-tertiary");
    expect(note).toHaveTextContent(/AI/i);
  });

  it("emits ai_disclaimer_view analytics event on mount", async () => {
    const events: Array<CustomEvent<{ type: string }>> = [];
    const onAnalytics = (event: Event) => {
      events.push(event as CustomEvent<{ type: string }>);
    };

    window.addEventListener("perspectiveshift:analytics", onAnalytics);
    render(<AiDisclaimerBanner />);

    await waitFor(() => {
      expect(events.length).toBeGreaterThan(0);
    });

    const seen = events.some((event) => event.detail?.type === "ai_disclaimer_view");
    expect(seen).toBe(true);
    window.removeEventListener("perspectiveshift:analytics", onAnalytics);
  });
});
