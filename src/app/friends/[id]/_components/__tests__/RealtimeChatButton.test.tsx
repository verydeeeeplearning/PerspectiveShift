import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RealtimeChatButton } from "../RealtimeChatButton";

describe("RealtimeChatButton", () => {
  it("renders link when eligible", () => {
    render(<RealtimeChatButton friendshipId="f-1" eligible={true} />);
    const link = screen.getByRole("link", { name: "실시간 채팅하기" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/chat/f-1");
  });

  it("renders locked status when not eligible", () => {
    render(
      <RealtimeChatButton
        friendshipId="f-1"
        eligible={false}
        reason="라이트 프로토콜을 1회 이상 완료해야 합니다"
      />,
    );
    expect(screen.getByText("실시간 채팅 잠금")).toBeInTheDocument();
    expect(
      screen.getByText("라이트 프로토콜을 1회 이상 완료해야 합니다"),
    ).toBeInTheDocument();
  });

  it("shows locked without reason when reason is not provided", () => {
    render(<RealtimeChatButton friendshipId="f-1" eligible={false} />);
    expect(screen.getByText("실시간 채팅 잠금")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("does not render link when not eligible", () => {
    render(<RealtimeChatButton friendshipId="f-1" eligible={false} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
