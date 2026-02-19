import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GiftRevealCard from "../_components/GiftRevealCard";

describe("GiftRevealCard", () => {
  it("renders the gift text", () => {
    render(<GiftRevealCard text="좋은 대화였어요" />);
    expect(screen.getByText("좋은 대화였어요")).toBeDefined();
  });

  it("shows envelope emoji and description", () => {
    render(<GiftRevealCard text="감사해요" />);
    expect(screen.getByText("상대방이 당신에게 남긴 한 마디")).toBeDefined();
    expect(screen.getByLabelText("편지")).toBeDefined();
  });
});
