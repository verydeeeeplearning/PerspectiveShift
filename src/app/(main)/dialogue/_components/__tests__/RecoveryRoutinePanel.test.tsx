import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RecoveryRoutinePanel from "../RecoveryRoutinePanel";

describe("RecoveryRoutinePanel", () => {
  const messages = ["힘든 대화였나요?", "잠시 쉬어가는 건 어떨까요?"];

  it("shows confirmation dialog before recovery", () => {
    const onLater = vi.fn();
    const onFindNew = vi.fn();
    render(<RecoveryRoutinePanel messages={messages} onLater={onLater} onFindNew={onFindNew} />);

    fireEvent.click(screen.getByText("바로 찾아봐요"));

    expect(screen.getByText(/복구를 진행하면/)).toBeInTheDocument();
    expect(onFindNew).not.toHaveBeenCalled();
  });

  it("calls onFindNew only after confirmation", () => {
    const onLater = vi.fn();
    const onFindNew = vi.fn();
    render(<RecoveryRoutinePanel messages={messages} onLater={onLater} onFindNew={onFindNew} />);

    fireEvent.click(screen.getByText("바로 찾아봐요"));
    fireEvent.click(screen.getByText("확인"));

    expect(onFindNew).toHaveBeenCalledWith([
      "topic_change",
      "difficulty_down",
      "time_reduce",
    ]);
  });

  it("renders 나중에 할게요 as primary button", () => {
    const onLater = vi.fn();
    const onFindNew = vi.fn();
    render(<RecoveryRoutinePanel messages={messages} onLater={onLater} onFindNew={onFindNew} />);

    const laterBtn = screen.getByText("나중에 할게요");
    expect(laterBtn.className).toContain("bg-indigo");
  });

  it("shows recovery badge by default", () => {
    render(<RecoveryRoutinePanel messages={messages} onLater={vi.fn()} onFindNew={vi.fn()} />);
    expect(screen.getByText("복구 모드")).toBeInTheDocument();
  });
});
