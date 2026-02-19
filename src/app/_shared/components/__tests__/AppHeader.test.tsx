import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const { mockPush, mockBack } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockBack: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

import { AppHeader } from "../AppHeader";

describe("AppHeader", () => {
  it("renders title when provided", () => {
    render(<AppHeader title="매칭" />);
    expect(screen.getByText("매칭")).toBeInTheDocument();
  });

  it("does not render title when not provided", () => {
    const { container } = render(<AppHeader />);
    expect(container.querySelector("h1")).not.toBeInTheDocument();
  });

  it("does not show back button by default", () => {
    render(<AppHeader title="매칭" />);
    expect(screen.queryByLabelText("뒤로 가기")).not.toBeInTheDocument();
  });

  it("shows back button when showBack is true", () => {
    render(<AppHeader title="대화 상세" showBack />);
    expect(screen.getByLabelText("뒤로 가기")).toBeInTheDocument();
  });

  it("navigates to parentRoute when back button is clicked", () => {
    render(<AppHeader title="대화 상세" showBack parentRoute="/dialogue" />);
    fireEvent.click(screen.getByLabelText("뒤로 가기"));
    expect(mockPush).toHaveBeenCalledWith("/dialogue");
  });

  it("calls router.back() when no parentRoute is specified", () => {
    render(<AppHeader title="대화 상세" showBack />);
    fireEvent.click(screen.getByLabelText("뒤로 가기"));
    expect(mockBack).toHaveBeenCalledOnce();
  });

  it("renders right action when provided", () => {
    render(
      <AppHeader
        title="친구"
        rightAction={<button>설정</button>}
      />,
    );
    expect(screen.getByText("설정")).toBeInTheDocument();
  });

  it("renders as a header element", () => {
    render(<AppHeader title="매칭" />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
