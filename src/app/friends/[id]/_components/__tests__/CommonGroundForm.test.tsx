import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommonGroundForm } from "../CommonGroundForm";

describe("CommonGroundForm", () => {
  it("renders three text fields", () => {
    render(<CommonGroundForm sessionId="lp-1" onSubmit={vi.fn()} />);
    expect(screen.getByLabelText("우리가 동의하는 1가지")).toBeInTheDocument();
    expect(screen.getByLabelText("아직 다른 1가지")).toBeInTheDocument();
    expect(screen.getByLabelText("더 알아보고 싶은 1가지")).toBeInTheDocument();
  });

  it("disables submit when fields are empty", () => {
    render(<CommonGroundForm sessionId="lp-1" onSubmit={vi.fn()} />);
    const button = screen.getByRole("button", { name: "제출하기" });
    expect(button).toBeDisabled();
  });

  it("enables submit when all fields are filled", () => {
    render(<CommonGroundForm sessionId="lp-1" onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("우리가 동의하는 1가지"), {
      target: { value: "fairness" },
    });
    fireEvent.change(screen.getByLabelText("아직 다른 1가지"), {
      target: { value: "method" },
    });
    fireEvent.change(screen.getByLabelText("더 알아보고 싶은 1가지"), {
      target: { value: "impact" },
    });
    const button = screen.getByRole("button", { name: "제출하기" });
    expect(button).not.toBeDisabled();
  });

  it("calls onSubmit with correct data", () => {
    const onSubmit = vi.fn();
    render(<CommonGroundForm sessionId="lp-1" onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText("우리가 동의하는 1가지"), {
      target: { value: "fairness" },
    });
    fireEvent.change(screen.getByLabelText("아직 다른 1가지"), {
      target: { value: "method" },
    });
    fireEvent.change(screen.getByLabelText("더 알아보고 싶은 1가지"), {
      target: { value: "impact" },
    });
    fireEvent.submit(screen.getByRole("form"));
    expect(onSubmit).toHaveBeenCalledWith({
      agreedPoint: "fairness",
      differentPoint: "method",
      curiousPoint: "impact",
    });
  });
});
