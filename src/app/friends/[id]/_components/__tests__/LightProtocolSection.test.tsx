import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LightProtocolSection } from "../LightProtocolSection";

describe("LightProtocolSection", () => {
  it("renders three protocol buttons", () => {
    render(<LightProtocolSection onStart={vi.fn()} />);
    expect(screen.getByLabelText("Common Ground Check 시작")).toBeInTheDocument();
    expect(screen.getByLabelText("Joint Question 시작")).toBeInTheDocument();
    expect(screen.getByLabelText("Switch Sides Mini 시작")).toBeInTheDocument();
  });

  it("shows duration for each protocol", () => {
    render(<LightProtocolSection onStart={vi.fn()} />);
    expect(screen.getByText("(3분)")).toBeInTheDocument();
    expect(screen.getAllByText("(5분)")).toHaveLength(2);
  });

  it("calls onStart with correct type when clicked", async () => {
    const onStart = vi.fn().mockResolvedValue(undefined);
    render(<LightProtocolSection onStart={onStart} />);

    fireEvent.click(screen.getByLabelText("Common Ground Check 시작"));
    await waitFor(() => {
      expect(onStart).toHaveBeenCalledWith("COMMON_GROUND");
    });
  });

  it("disables all buttons when disabled prop is true", () => {
    render(<LightProtocolSection onStart={vi.fn()} disabled />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it("displays section heading", () => {
    render(<LightProtocolSection onStart={vi.fn()} />);
    expect(screen.getByText("라이트 프로토콜")).toBeInTheDocument();
  });
});
