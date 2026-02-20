import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WaitingForOpponent } from "../WaitingForOpponent";

describe("WaitingForOpponent", () => {
  it("shows typing indicator and step-aware message", () => {
    render(<WaitingForOpponent currentStep="ANSWER" />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(
      screen.getByText("Waiting for your partner's answer"),
    ).toBeInTheDocument();
  });
});

