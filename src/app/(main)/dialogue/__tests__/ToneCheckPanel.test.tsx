import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ToneCheckPanel } from "../_components/ToneCheckPanel";
import type { ToneAlternative } from "@/domain/value-objects/tone-suggestion";

describe("ToneCheckPanel", () => {
  const defaultAlternatives: ToneAlternative[] = [
    { category: "summary_confirm", text: "요약해보면, ~라는 뜻이죠?", label: "요약+확인질문" },
    { category: "interest_reason", text: "흥미로운데요, 왜 그렇게 생각하시나요?", label: "관심+근거질문" },
    { category: "uncertainty", text: "제가 잘 이해했는지 모르겠지만...", label: "불확실성 표현" },
  ];

  it("renders all alternatives", () => {
    const onSelect = vi.fn();
    render(
      <ToneCheckPanel
        originalText="원본 텍스트"
        alternatives={defaultAlternatives}
        onSelect={onSelect}
      />,
    );
    expect(screen.getByText(/요약해보면/)).toBeInTheDocument();
    expect(screen.getByText(/흥미로운데요/)).toBeInTheDocument();
    expect(screen.getByText(/잘 이해했는지/)).toBeInTheDocument();
  });

  it("renders alternative labels", () => {
    const onSelect = vi.fn();
    render(
      <ToneCheckPanel
        originalText="원본 텍스트"
        alternatives={defaultAlternatives}
        onSelect={onSelect}
      />,
    );
    expect(screen.getByText("요약+확인질문")).toBeInTheDocument();
    expect(screen.getByText("관심+근거질문")).toBeInTheDocument();
    expect(screen.getByText("불확실성 표현")).toBeInTheDocument();
  });

  it("always shows '원래대로 보내기' button", () => {
    const onSelect = vi.fn();
    render(
      <ToneCheckPanel
        originalText="원본 텍스트"
        alternatives={defaultAlternatives}
        onSelect={onSelect}
      />,
    );
    expect(screen.getByText("원래대로 보내기")).toBeInTheDocument();
  });

  it("calls onSelect with USE_ALTERNATIVE_A when first alternative clicked", () => {
    const onSelect = vi.fn();
    render(
      <ToneCheckPanel
        originalText="원본 텍스트"
        alternatives={defaultAlternatives}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText(/요약해보면/));
    expect(onSelect).toHaveBeenCalledWith("USE_ALTERNATIVE_A");
  });

  it("calls onSelect with USE_ALTERNATIVE_B when second alternative clicked", () => {
    const onSelect = vi.fn();
    render(
      <ToneCheckPanel
        originalText="원본 텍스트"
        alternatives={defaultAlternatives}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText(/흥미로운데요/));
    expect(onSelect).toHaveBeenCalledWith("USE_ALTERNATIVE_B");
  });

  it("calls onSelect with USE_ALTERNATIVE_C when third alternative clicked", () => {
    const onSelect = vi.fn();
    render(
      <ToneCheckPanel
        originalText="원본 텍스트"
        alternatives={defaultAlternatives}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText(/잘 이해했는지/));
    expect(onSelect).toHaveBeenCalledWith("USE_ALTERNATIVE_C");
  });

  it("calls onSelect with SEND_ORIGINAL when '원래대로 보내기' clicked", () => {
    const onSelect = vi.fn();
    render(
      <ToneCheckPanel
        originalText="원본 텍스트"
        alternatives={defaultAlternatives}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText("원래대로 보내기"));
    expect(onSelect).toHaveBeenCalledWith("SEND_ORIGINAL");
  });

  it("does not contain warning/detection/inappropriate language", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <ToneCheckPanel
        originalText="원본 텍스트"
        alternatives={defaultAlternatives}
        onSelect={onSelect}
      />,
    );
    const text = container.textContent ?? "";
    expect(text).not.toContain("경고");
    expect(text).not.toContain("감지");
    expect(text).not.toContain("부적절");
  });

  it("has correct aria-label on region", () => {
    const onSelect = vi.fn();
    render(
      <ToneCheckPanel
        originalText="원본 텍스트"
        alternatives={defaultAlternatives}
        onSelect={onSelect}
      />,
    );
    expect(screen.getByRole("region", { name: "톤 체크 제안" })).toBeInTheDocument();
  });

  it("has aria-label on '원래대로 보내기' button", () => {
    const onSelect = vi.fn();
    render(
      <ToneCheckPanel
        originalText="원본 텍스트"
        alternatives={defaultAlternatives}
        onSelect={onSelect}
      />,
    );
    expect(screen.getByLabelText("원래대로 보내기")).toBeInTheDocument();
  });

  it("has aria-labels on alternative buttons", () => {
    const onSelect = vi.fn();
    render(
      <ToneCheckPanel
        originalText="원본 텍스트"
        alternatives={defaultAlternatives}
        onSelect={onSelect}
      />,
    );
    expect(screen.getByLabelText(/요약\+확인질문/)).toBeInTheDocument();
    expect(screen.getByLabelText(/관심\+근거질문/)).toBeInTheDocument();
    expect(screen.getByLabelText(/불확실성 표현/)).toBeInTheDocument();
  });

  it("displays original text", () => {
    const onSelect = vi.fn();
    render(
      <ToneCheckPanel
        originalText="내 원본 문장입니다"
        alternatives={defaultAlternatives}
        onSelect={onSelect}
      />,
    );
    expect(screen.getByText(/내 원본 문장입니다/)).toBeInTheDocument();
  });

  it("shows suggestion framing heading", () => {
    const onSelect = vi.fn();
    render(
      <ToneCheckPanel
        originalText="원본"
        alternatives={defaultAlternatives}
        onSelect={onSelect}
      />,
    );
    expect(screen.getByText("더 잘 전달되는 표현이 있어요")).toBeInTheDocument();
  });
});
