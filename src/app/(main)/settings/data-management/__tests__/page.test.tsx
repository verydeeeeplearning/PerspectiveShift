import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import DataManagementPage from "../page";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("DataManagementPage", () => {
  const capturedEvents: CustomEvent[] = [];

  function analyticsListener(e: Event) {
    if (e instanceof CustomEvent) {
      capturedEvents.push(e);
    }
  }

  beforeEach(() => {
    capturedEvents.length = 0;
    window.addEventListener("perspectiveshift:analytics", analyticsListener);
  });

  afterEach(() => {
    window.removeEventListener("perspectiveshift:analytics", analyticsListener);
  });

  it("renders the page title", () => {
    render(<DataManagementPage />);
    expect(screen.getByText("데이터 관리")).toBeInTheDocument();
  });

  it("renders stored data overview", () => {
    render(<DataManagementPage />);
    expect(screen.getByText("닉네임")).toBeInTheDocument();
    expect(
      screen.getByText("입장 프로필 (Stance Profile)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("대화 기록 (Dialogue History)"),
    ).toBeInTheDocument();
  });

  it("fires data_mgmt_view analytics on mount", () => {
    render(<DataManagementPage />);
    const viewEvent = capturedEvents.find(
      (e) => e.detail?.type === "data_mgmt_view",
    );
    expect(viewEvent).toBeDefined();
  });

  it("shows alert when export button is clicked", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<DataManagementPage />);

    fireEvent.click(screen.getByRole("button", { name: "데이터 내보내기" }));
    expect(alertSpy).toHaveBeenCalledWith("준비 중입니다");

    const exportEvent = capturedEvents.find(
      (e) => e.detail?.type === "data_export_click",
    );
    expect(exportEvent).toBeDefined();

    alertSpy.mockRestore();
  });

  it("triggers confirm dialog on delete request", () => {
    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockImplementation(() => true);
    render(<DataManagementPage />);

    fireEvent.click(screen.getByText("데이터 삭제 요청"));
    expect(confirmSpy).toHaveBeenCalledWith(
      "정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    );

    const deleteRequestEvent = capturedEvents.find(
      (e) => e.detail?.type === "data_delete_request",
    );
    expect(deleteRequestEvent).toBeDefined();

    const deleteConfirmEvent = capturedEvents.find(
      (e) => e.detail?.type === "data_delete_confirm",
    );
    expect(deleteConfirmEvent).toBeDefined();

    confirmSpy.mockRestore();
  });

  it("does not fire data_delete_confirm when user cancels", () => {
    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockImplementation(() => false);
    render(<DataManagementPage />);

    // Clear captured events from mount
    capturedEvents.length = 0;

    fireEvent.click(screen.getByText("데이터 삭제 요청"));

    const deleteConfirmEvent = capturedEvents.find(
      (e) => e.detail?.type === "data_delete_confirm",
    );
    expect(deleteConfirmEvent).toBeUndefined();

    confirmSpy.mockRestore();
  });

  it("renders privacy policy link", () => {
    render(<DataManagementPage />);
    const link = screen.getByText("개인정보 처리방침 보기");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/privacy");
  });
});
