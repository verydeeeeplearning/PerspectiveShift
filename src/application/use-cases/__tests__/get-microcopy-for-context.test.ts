import { describe, it, expect } from "vitest";
import { GetMicrocopyForContextUseCase } from "../get-microcopy-for-context";

describe("GetMicrocopyForContextUseCase", () => {
  const uc = new GetMicrocopyForContextUseCase();

  it("returns microcopy for loading context", () => {
    const r = uc.execute({ context: "loading", index: 0 });
    expect(r.text).toBe("설득이 아니라, 이해가 목표예요.");
    expect(r.context).toBe("loading");
  });

  it("returns different copy with different index", () => {
    const r = uc.execute({ context: "waiting", index: 1 });
    expect(r.text).toBe("불편하면 언제든 난이도를 낮출 수 있어요.");
  });
});
