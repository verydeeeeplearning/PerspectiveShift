import { describe, it, expect } from "vitest";
import { SubmitRoleplaySteelmanUseCase } from "../submit-roleplay-steelman";

describe("SubmitRoleplaySteelmanUseCase", () => {
  const uc = new SubmitRoleplaySteelmanUseCase();

  it("submits completed roleplay", () => {
    const result = uc.execute({
      oppositeRolePrompt: "반대 입장 prompt",
      userResponse: "상대 입장에서 보면...",
      isSkipped: false,
    });
    expect(result.isSkipped).toBe(false);
    expect(result.userResponse).toContain("상대 입장");
  });

  it("submits skipped roleplay", () => {
    const result = uc.execute({
      oppositeRolePrompt: "prompt",
      userResponse: null,
      isSkipped: true,
    });
    expect(result.isSkipped).toBe(true);
  });

  it("returns whether roleplay was completed or skipped", () => {
    const result = uc.execute({
      oppositeRolePrompt: "prompt",
      userResponse: "응답",
      isSkipped: false,
    });
    expect(result).toHaveProperty("isSkipped");
    expect(result).toHaveProperty("userResponse");
  });
});
