import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HighlightPopup } from "../_components/HighlightPopup";

describe("HighlightPopup", () => {
  const onHighlight = vi.fn();
  const onClose = vi.fn();

  it("shows highlighted text", () => {
    render(
      <HighlightPopup
        open={true}
        highlightedText="중요한 부분"
        onHighlight={onHighlight}
        onClose={onClose}
      />,
    );
    expect(screen.getByText(/중요한 부분/)).toBeInTheDocument();
  });

  it("calls onHighlight with auto-quote when underline button clicked", () => {
    render(
      <HighlightPopup
        open={true}
        highlightedText="중요한 부분"
        onHighlight={onHighlight}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByText(/밑줄/));
    expect(onHighlight).toHaveBeenCalledWith(
      expect.stringContaining("중요한 부분"),
    );
  });

  it("does not render when closed", () => {
    const { container } = render(
      <HighlightPopup
        open={false}
        highlightedText="텍스트"
        onHighlight={onHighlight}
        onClose={onClose}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows close button", () => {
    render(
      <HighlightPopup
        open={true}
        highlightedText="텍스트"
        onHighlight={onHighlight}
        onClose={onClose}
      />,
    );
    const closeBtn = screen.getByLabelText(/닫기/);
    expect(closeBtn).toBeInTheDocument();
  });
});
