import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProgressBar } from "../components/ProgressBar";

describe("ProgressBar", () => {
  it("renders current and total", () => {
    render(<ProgressBar current={3} total={5} phase="core" />);
    expect(screen.getByText(/3\/5/)).toBeInTheDocument();
  });

  it("shows percentage", () => {
    render(<ProgressBar current={3} total={5} phase="core" />);
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("labels core phase in Korean", () => {
    render(<ProgressBar current={1} total={5} phase="core" />);
    expect(screen.getByText(/핵심 질문/)).toBeInTheDocument();
  });

  it("labels extended phase in Korean", () => {
    render(<ProgressBar current={1} total={5} phase="extended" />);
    expect(screen.getByText(/확장 질문/)).toBeInTheDocument();
  });

  it("has progressbar role", () => {
    render(<ProgressBar current={2} total={5} phase="core" />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
