import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ThoughtMapChart } from "../components/ThoughtMapChart";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";

// recharts uses ResizeObserver which isn't available in jsdom
vi.stubGlobal(
  "ResizeObserver",
  vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
);

const SAMPLE_VECTOR: Record<StanceDimension, number> = {
  TECH_REGULATION: 0.5,
  REDISTRIBUTION: 0.3,
  WORK_LIFE: 0.1,
  MERITOCRACY: -0.2,
  TECH_OPTIMISM: 0.4,
  OPPORTUNITY_EQUALITY: 0.2,
};

describe("ThoughtMapChart", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <ThoughtMapChart vector={SAMPLE_VECTOR} />,
    );
    expect(container.querySelector("[aria-label='Thought Map 레이더 차트']")).toBeInTheDocument();
  });
});
