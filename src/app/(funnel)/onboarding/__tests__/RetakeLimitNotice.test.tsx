import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RetakeLimitNotice } from "../components/RetakeLimitNotice";

describe("RetakeLimitNotice", () => {
  it("renders nothing when allowed and no warning", () => {
    const { container } = render(
      <RetakeLimitNotice allowed={true} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders block message when not allowed", () => {
    render(
      <RetakeLimitNotice
        allowed={false}
        message="오늘은 이미 다시 풀어보셨어요. 내일 다시 해볼까요?"
      />,
    );

    expect(screen.getByText(/내일/)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders warning when allowed but with warning", () => {
    render(
      <RetakeLimitNotice
        allowed={true}
        warning="여러 번 다시 풀어보셨네요. 결과가 크게 달라지지 않을 수 있어요."
      />,
    );

    expect(screen.getByText(/여러 번/)).toBeInTheDocument();
  });

  it("uses alert role for block message", () => {
    render(
      <RetakeLimitNotice
        allowed={false}
        message="내일 다시 해볼까요?"
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("uses status role for warning", () => {
    render(
      <RetakeLimitNotice
        allowed={true}
        warning="결과가 크게 달라지지 않을 수 있어요."
      />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
