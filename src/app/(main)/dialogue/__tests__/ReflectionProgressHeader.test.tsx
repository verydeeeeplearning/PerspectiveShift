import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ReflectionProgressHeader } from "../_components/ReflectionProgressHeader";

describe("ReflectionProgressHeader", () => {
  it("shows encouraging message", () => {
    render(<ReflectionProgressHeader currentStep={0} totalSteps={4} />);
    expect(screen.getByText(/마지막 2분/)).toBeInTheDocument();
  });

  it("shows progress indicator", () => {
    render(<ReflectionProgressHeader currentStep={2} totalSteps={4} />);
    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByText(/4/)).toBeInTheDocument();
  });

  it("shows step count correctly", () => {
    render(<ReflectionProgressHeader currentStep={0} totalSteps={4} />);
    expect(screen.getByText(/1/)).toBeInTheDocument();
  });
});
