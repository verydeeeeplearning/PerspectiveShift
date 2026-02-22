import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BatchLoadingIndicator } from "../components/BatchLoadingIndicator";

describe("BatchLoadingIndicator", () => {
  it("renders loading spinner and batch info", () => {
    render(
      <BatchLoadingIndicator
        batchIndex={1}
        totalAnswered={15}
        targetTotal={30}
      />,
    );

    expect(screen.getByText("다음 질문을 준비하고 있어요")).toBeInTheDocument();
    expect(screen.getByText("배치 2 생성 중...")).toBeInTheDocument();
    expect(screen.getByText("15문항 완료")).toBeInTheDocument();
    expect(screen.getByText("30문항")).toBeInTheDocument();
  });

  it("renders progress bar with correct percentage", () => {
    render(
      <BatchLoadingIndicator
        batchIndex={0}
        totalAnswered={10}
        targetTotal={20}
      />,
    );

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");
  });

  it("renders error state with message", () => {
    render(
      <BatchLoadingIndicator
        batchIndex={1}
        totalAnswered={15}
        targetTotal={30}
        error="서버 연결에 실패했습니다"
      />,
    );

    expect(
      screen.getByText("질문 생성 중 오류가 발생했어요"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("서버 연결에 실패했습니다"),
    ).toBeInTheDocument();
  });

  it("renders retry button in error state and calls onRetry", () => {
    const onRetry = vi.fn();
    render(
      <BatchLoadingIndicator
        batchIndex={1}
        totalAnswered={15}
        targetTotal={30}
        error="서버 오류"
        onRetry={onRetry}
      />,
    );

    const retryButton = screen.getByText("다시 시도");
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(
      <BatchLoadingIndicator
        batchIndex={1}
        totalAnswered={15}
        targetTotal={30}
        error="서버 오류"
      />,
    );

    expect(screen.queryByText("다시 시도")).not.toBeInTheDocument();
  });

  it("renders fallback continue button and calls handler", () => {
    const onContinueWithFallback = vi.fn();
    render(
      <BatchLoadingIndicator
        batchIndex={1}
        totalAnswered={15}
        targetTotal={30}
        error="서버 오류"
        onContinueWithFallback={onContinueWithFallback}
      />,
    );

    const fallbackButton = screen.getByText("기본 질문으로 계속하기");
    fireEvent.click(fallbackButton);
    expect(onContinueWithFallback).toHaveBeenCalledOnce();
  });
});
