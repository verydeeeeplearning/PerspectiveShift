import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "./page";

describe("Home Page", () => {
  it("renders the main heading", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /PerspectiveShift/i }),
    ).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<Home />);
    expect(screen.getByText(/다양한 관점을 연결하는/)).toBeInTheDocument();
  });
});
