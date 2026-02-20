import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TypingIndicator } from "../TypingIndicator";

describe("TypingIndicator", () => {
  it("renders default typing status", () => {
    render(<TypingIndicator />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Someone is typing...")).toBeInTheDocument();
  });

  it("renders three animated dots", () => {
    render(<TypingIndicator />);

    const dots = screen.getAllByTestId("typing-dot");
    expect(dots).toHaveLength(3);
  });

  it("accepts custom label", () => {
    render(<TypingIndicator label="Waiting for response..." />);

    expect(screen.getByText("Waiting for response...")).toBeInTheDocument();
  });
});

