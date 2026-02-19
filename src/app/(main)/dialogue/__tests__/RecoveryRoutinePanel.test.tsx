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

  it("has two equally weighted CTA buttons", () => {
    render(<RecoveryRoutinePanel messages={messages} onLater={vi.fn()} onFindNew={vi.fn()} />);
    expect(screen.getByText("나중에 다시 보기")).toBeDefined();
    expect(screen.getByText("바로 찾아봐요")).toBeDefined();
  });

  it("calls onLater and onFindNew correctly", () => {
    const onLater = vi.fn();
    const onFindNew = vi.fn();
    render(<RecoveryRoutinePanel messages={messages} onLater={onLater} onFindNew={onFindNew} />);
    fireEvent.click(screen.getByText("나중에 다시 보기"));
    fireEvent.click(screen.getByText("바로 찾아봐요"));
    expect(onLater).toHaveBeenCalledTimes(1);
    expect(onFindNew).toHaveBeenCalledTimes(1);
  });
});
