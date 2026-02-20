import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AnchorFilterPanel } from "../components/AnchorFilterPanel";

describe("AnchorFilterPanel", () => {
  it("keeps apply button disabled until an anchor value is selected", () => {
    render(<AnchorFilterPanel energyLevel="NORMAL" onApply={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /앵커 필터/i }));
    expect(screen.getByRole("button", { name: "필터 적용" })).toBeDisabled();
  });

  it("shows range preview capped by LOW energy", () => {
    render(<AnchorFilterPanel energyLevel="LOW" onApply={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /앵커 필터/i }));
    fireEvent.change(screen.getByLabelText("다름의 정도"), {
      target: { value: "100" },
    });

    expect(screen.getByText(/0\.200 - 0\.400/)).toBeInTheDocument();
  });

  it("calls onApply with normalized filter payload", async () => {
    const onApply = vi.fn();
    render(<AnchorFilterPanel energyLevel="LOW" onApply={onApply} />);

    fireEvent.click(screen.getByRole("button", { name: /앵커 필터/i }));
    fireEvent.click(screen.getByRole("button", { name: "30대" }));
    fireEvent.change(screen.getByLabelText("다름의 정도"), {
      target: { value: "100" },
    });
    fireEvent.click(screen.getByRole("button", { name: "필터 적용" }));

    await waitFor(() => {
      expect(onApply).toHaveBeenCalledTimes(1);
    });

    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        anchorType: "age_group",
        anchorValue: "30대",
        differenceLevel: 1,
        appliedRange: { min: 0.2, max: 0.4 },
      }),
    );
  });

  it("emits anchor_filter_set analytics event when applying", async () => {
    const events: Array<CustomEvent<{ type: string }>> = [];
    const onAnalytics = (event: Event) => {
      events.push(event as CustomEvent<{ type: string }>);
    };

    window.addEventListener("perspectiveshift:analytics", onAnalytics);
    render(<AnchorFilterPanel energyLevel="NORMAL" onApply={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /앵커 필터/i }));
    fireEvent.click(screen.getByRole("button", { name: "30대" }));
    fireEvent.click(screen.getByRole("button", { name: "필터 적용" }));

    await waitFor(() => {
      expect(events.length).toBeGreaterThan(0);
    });

    const seen = events.some((event) => event.detail?.type === "anchor_filter_set");
    expect(seen).toBe(true);
    window.removeEventListener("perspectiveshift:analytics", onAnalytics);
  });
});
