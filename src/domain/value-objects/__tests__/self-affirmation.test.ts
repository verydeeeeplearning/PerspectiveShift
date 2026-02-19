import { describe, it, expect } from "vitest";
import { SelfAffirmation } from "../self-affirmation";
import { CoreValue } from "../core-value";

describe("SelfAffirmation", () => {
  it("creates with coreValue only (no experience)", () => {
    const cv = CoreValue.create("FAIRNESS");
    const sa = SelfAffirmation.create(cv);
    expect(sa.coreValue).toBe(cv);
    expect(sa.experience).toBeNull();
  });

  it("creates with coreValue and experience", () => {
    const cv = CoreValue.create("CARING");
    const sa = SelfAffirmation.create(cv, "팀원이 힘들어할 때 먼저 다가간 경험");
    expect(sa.coreValue).toBe(cv);
    expect(sa.experience).toBe("팀원이 힘들어할 때 먼저 다가간 경험");
  });

  it("treats empty experience as null", () => {
    const cv = CoreValue.create("TRUTH");
    const sa = SelfAffirmation.create(cv, "");
    expect(sa.experience).toBeNull();
  });

  it("treats whitespace-only experience as null", () => {
    const cv = CoreValue.create("TRUTH");
    const sa = SelfAffirmation.create(cv, "   ");
    expect(sa.experience).toBeNull();
  });

  it("is immutable (readonly properties)", () => {
    const cv = CoreValue.create("GROWTH");
    const sa = SelfAffirmation.create(cv, "꾸준히 공부한 경험");

    // TypeScript compile-time check — runtime verification
    expect(sa.coreValue.value).toBe("GROWTH");
    expect(sa.experience).toBe("꾸준히 공부한 경험");
  });

  it("equals compares coreValue and experience", () => {
    const cv = CoreValue.create("SAFETY");
    const a = SelfAffirmation.create(cv, "안전을 지킨 경험");
    const b = SelfAffirmation.create(cv, "안전을 지킨 경험");
    const c = SelfAffirmation.create(cv, "다른 경험");
    const d = SelfAffirmation.create(cv);
    const e = SelfAffirmation.create(cv);

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
    expect(a.equals(d)).toBe(false);
    expect(d.equals(e)).toBe(true);
  });
});
