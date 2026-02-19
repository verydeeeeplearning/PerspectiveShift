import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SavedPersonaList } from "../SavedPersonaList";

describe("SavedPersonaList", () => {
  it("renders empty state", () => {
    render(<SavedPersonaList personas={[]} onResume={vi.fn()} />);
    expect(screen.getByText("아직 저장된 페르소나가 없어요.")).toBeInTheDocument();
  });

  it("renders persona cards and resume action", () => {
    const onResume = vi.fn();
    render(
      <SavedPersonaList
        personas={[
          {
            personaId: "persona-1",
            name: "현실주의 직장인",
            conversationCount: 3,
            lastConversationAt: "2026-02-19",
          },
        ]}
        onResume={onResume}
      />,
    );

    expect(screen.getByText("현실주의 직장인")).toBeInTheDocument();
    fireEvent.click(screen.getByText("이어서 대화하기"));
    expect(onResume).toHaveBeenCalledWith("persona-1");
  });
});
