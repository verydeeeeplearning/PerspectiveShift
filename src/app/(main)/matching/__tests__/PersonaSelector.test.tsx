import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PersonaSelector } from "../components/PersonaSelector";

const mockPersonas = [
  {
    id: "persona-1",
    name: "현실주의 직장인",
    ageGroup: "30대",
    jobCategory: "IT직군",
    stanceLabel: "경제 보수",
    description: "실용적 관점에서 경제 정책을 바라봅니다.",
  },
  {
    id: "persona-2",
    name: "공감하는 교육자",
    ageGroup: "40대",
    jobCategory: "교육직",
    stanceLabel: "사회 진보",
    description: "교육 현장의 경험을 바탕으로 사회 정책을 이야기합니다.",
  },
  {
    id: "persona-3",
    name: "탐구하는 대학생",
    ageGroup: "20대",
    jobCategory: "학생",
    stanceLabel: "중도",
    description: "다양한 관점을 탐구하며 균형 잡힌 시각을 추구합니다.",
  },
];

describe("PersonaSelector", () => {
  it("renders 3 persona cards", () => {
    const onSelect = vi.fn();
    render(<PersonaSelector personas={mockPersonas} onSelect={onSelect} />);

    expect(screen.getByText("현실주의 직장인")).toBeInTheDocument();
    expect(screen.getByText("공감하는 교육자")).toBeInTheDocument();
    expect(screen.getByText("탐구하는 대학생")).toBeInTheDocument();
  });

  it("displays persona details", () => {
    const onSelect = vi.fn();
    render(<PersonaSelector personas={mockPersonas} onSelect={onSelect} />);

    expect(screen.getByText("경제 보수")).toBeInTheDocument();
    expect(screen.getByText("사회 진보")).toBeInTheDocument();
    expect(screen.getByText("중도")).toBeInTheDocument();
    expect(
      screen.getByText("실용적 관점에서 경제 정책을 바라봅니다."),
    ).toBeInTheDocument();
  });

  it("calls onSelect with persona id on click", () => {
    const onSelect = vi.fn();
    render(<PersonaSelector personas={mockPersonas} onSelect={onSelect} />);

    fireEvent.click(screen.getByLabelText("현실주의 직장인과 대화하기"));
    expect(onSelect).toHaveBeenCalledWith("persona-1");

    fireEvent.click(screen.getByLabelText("공감하는 교육자과 대화하기"));
    expect(onSelect).toHaveBeenCalledWith("persona-2");
  });

  it("renders notification button when prop provided", () => {
    const onSelect = vi.fn();
    const onRequestNotification = vi.fn();
    render(
      <PersonaSelector
        personas={mockPersonas}
        onSelect={onSelect}
        onRequestNotification={onRequestNotification}
      />,
    );

    const notifButton = screen.getByText("실제 사람과 매칭되면 알림 받기");
    expect(notifButton).toBeInTheDocument();

    fireEvent.click(notifButton);
    expect(onRequestNotification).toHaveBeenCalled();
  });

  it("does not render notification button when prop not provided", () => {
    const onSelect = vi.fn();
    render(<PersonaSelector personas={mockPersonas} onSelect={onSelect} />);

    expect(
      screen.queryByText("실제 사람과 매칭되면 알림 받기"),
    ).not.toBeInTheDocument();
  });

  it("has proper aria attributes", () => {
    const onSelect = vi.fn();
    render(<PersonaSelector personas={mockPersonas} onSelect={onSelect} />);

    expect(
      screen.getByRole("region", { name: "AI 대화 상대 선택" }),
    ).toBeInTheDocument();
  });
});
