import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

import { TopAppBar } from "../TopAppBar";

describe("TopAppBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("wordmark variant", () => {
    it("renders PerspectiveShift text", () => {
      render(<TopAppBar variant="wordmark" />);
      expect(screen.getByText("PerspectiveShift")).toBeInTheDocument();
    });

    it("uses heading font", () => {
      render(<TopAppBar variant="wordmark" />);
      const wordmark = screen.getByText("PerspectiveShift");
      expect(wordmark.className).toContain("font-heading");
    });
  });

  describe("title variant", () => {
    it("renders title text", () => {
      render(<TopAppBar variant="title" title="대화 진행 중" />);
      expect(screen.getByText("대화 진행 중")).toBeInTheDocument();
    });

    it("renders back button", () => {
      render(<TopAppBar variant="title" title="Test" />);
      expect(screen.getByLabelText("뒤로 가기")).toBeInTheDocument();
    });

    it("navigates back on back button click", () => {
      render(<TopAppBar variant="title" title="Test" />);
      fireEvent.click(screen.getByLabelText("뒤로 가기"));
      expect(mockBack).toHaveBeenCalledOnce();
    });

    it("navigates to parentRoute if provided", () => {
      render(
        <TopAppBar variant="title" title="Test" parentRoute="/matching" />,
      );
      fireEvent.click(screen.getByLabelText("뒤로 가기"));
      expect(mockPush).toHaveBeenCalledWith("/matching");
    });
  });

  describe("minimal variant", () => {
    it("renders back button only", () => {
      render(<TopAppBar variant="minimal" />);
      expect(screen.getByLabelText("뒤로 가기")).toBeInTheDocument();
      expect(screen.queryByText("PerspectiveShift")).not.toBeInTheDocument();
    });
  });

  describe("immersive variant", () => {
    it("renders close button", () => {
      render(<TopAppBar variant="immersive" />);
      expect(screen.getByLabelText("닫기")).toBeInTheDocument();
    });

    it("has transparent background", () => {
      const { container } = render(<TopAppBar variant="immersive" />);
      const header = container.querySelector("header");
      expect(header?.className).toContain("bg-transparent");
    });

    it("navigates home on close click", () => {
      render(<TopAppBar variant="immersive" />);
      fireEvent.click(screen.getByLabelText("닫기"));
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("renders rightAction when provided (non-immersive)", () => {
    render(
      <TopAppBar
        variant="wordmark"
        rightAction={<button aria-label="메뉴">Menu</button>}
      />,
    );
    expect(screen.getByLabelText("메뉴")).toBeInTheDocument();
  });

  it("applies glass background for non-immersive variants", () => {
    const { container } = render(<TopAppBar variant="wordmark" />);
    const header = container.querySelector("header");
    expect(header?.className).toContain("glass");
  });
});
