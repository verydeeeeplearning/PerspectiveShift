import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RecoveryRoutinePanel from "../_components/RecoveryRoutinePanel";

const messages = [
  "오늘 대화가 불편했다니 속상하네요.",
  "이번 대화는 기록에서 치울게요.",
  "지금 당장 새로 시작할 필요 없어요.",
];

describe("RecoveryRoutinePanel", () => {
  it("renders all empathy messages", () => {
    render(<RecoveryRoutinePanel messages={messages} onLater={vi.fn()} onFindNew={vi.fn()} />);
    expect(screen.getByText(/불편했다니/)).toBeDefined();
    expect(screen.getByText(/기록에서 치울게요/)).toBeDefined();
  });

  it("has primary '나중에 할게요' and secondary '바로 찾아봐요' buttons", () => {
    render(<RecoveryRoutinePanel messages={messages} onLater={vi.fn()} onFindNew={vi.fn()} />);
    expect(screen.getByText("나중에 할게요")).toBeDefined();
    expect(screen.getByText("바로 찾아봐요")).toBeDefined();
  });

  it("calls onLater directly, onFindNew after confirmation", () => {
    const onLater = vi.fn();
    const onFindNew = vi.fn();
    render(<RecoveryRoutinePanel messages={messages} onLater={onLater} onFindNew={onFindNew} />);

    fireEvent.click(screen.getByText("나중에 할게요"));
    expect(onLater).toHaveBeenCalledTimes(1);

    // 바로 찾아봐요 → 확인 다이얼로그 → 확인 버튼
    fireEvent.click(screen.getByText("바로 찾아봐요"));
    expect(onFindNew).not.toHaveBeenCalled(); // confirmation step
    fireEvent.click(screen.getByText("확인"));
    expect(onFindNew).toHaveBeenCalledTimes(1);
  });
});
