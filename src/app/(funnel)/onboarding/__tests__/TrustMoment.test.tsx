import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TrustMoment } from "../components/TrustMoment";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("TrustMoment", () => {
  it("renders lock title, checklist, and CTA", () => {
    render(<TrustMoment onProceed={vi.fn()} />);

    expect(
      screen.getByText("당신의 생각은 안전합니다"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("닉네임만 사용, 실명 비공개"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("답변 원문은 분석 후 즉시 삭제"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("언제든 모든 데이터 삭제 가능"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "시작하기" })).toBeInTheDocument();
  });

  it("toggles disclosure detail panel", () => {
    render(<TrustMoment onProceed={vi.fn()} />);

    const detailButton = screen.getByRole("button", {
      name: /자세히 보기/,
    });

    expect(detailButton).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(detailButton);
    expect(detailButton).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText(/온보딩 답변은 Thought Map 생성을 위한 신호로만 쓰이고/),
    ).toBeInTheDocument();
  });

  it("emits required trust moment events", () => {
    const onEvent = vi.fn();
    render(<TrustMoment onProceed={vi.fn()} onEvent={onEvent} />);

    fireEvent.click(screen.getByRole("button", { name: /자세히 보기/ }));
    fireEvent.click(screen.getByRole("button", { name: "내 데이터 관리 열기" }));
    fireEvent.click(screen.getByRole("button", { name: "시작하기" }));

    expect(onEvent).toHaveBeenCalledTimes(4);
    expect(onEvent).toHaveBeenNthCalledWith(1, "trust_moment_view");
    expect(onEvent).toHaveBeenNthCalledWith(2, "trust_moment_detail_expand");
    expect(onEvent).toHaveBeenNthCalledWith(3, "trust_moment_data_mgmt_click");
    expect(onEvent).toHaveBeenNthCalledWith(4, "trust_moment_proceed");
  });

  it("has accessible labels and roles", () => {
    render(<TrustMoment onProceed={vi.fn()} />);

    expect(
      screen.getByRole("region", { name: "신뢰 안내" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "내 데이터 관리 열기" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "시작하기" }),
    ).toBeInTheDocument();
  });

  it("navigates to /settings/data-management on data management click", () => {
    mockPush.mockClear();
    render(<TrustMoment onProceed={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "내 데이터 관리 열기" }));
    expect(mockPush).toHaveBeenCalledWith("/settings/data-management");
  });

  it("does not render inline data panel", () => {
    render(<TrustMoment onProceed={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "내 데이터 관리 열기" }));

    expect(
      screen.queryByRole("region", { name: "데이터 관리 패널" }),
    ).not.toBeInTheDocument();
  });
});
