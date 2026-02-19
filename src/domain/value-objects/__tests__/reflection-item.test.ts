import { describe, it, expect } from "vitest";
import {
  ReflectionItem,
  REFLECTION_TYPES,
  type ReflectionType,
} from "../reflection-item";

describe("ReflectionItem", () => {
  it("creates SUMMARY (R1) item", () => {
    const item = ReflectionItem.create("SUMMARY", "상대는 기술 규제에 반대하며...");
    expect(item.type).toBe("SUMMARY");
    expect(item.content).toBe("상대는 기술 규제에 반대하며...");
    expect(item.isRequired).toBe(true);
  });

  it("creates ACCURACY_CHECK (R2) item", () => {
    const item = ReflectionItem.create("ACCURACY_CHECK", "맞습니다");
    expect(item.type).toBe("ACCURACY_CHECK");
    expect(item.isRequired).toBe(true);
  });

  it("creates STEELMAN (R3) item", () => {
    const item = ReflectionItem.create("STEELMAN", "상대 관점의 가장 강한 논거는...");
    expect(item.type).toBe("STEELMAN");
    expect(item.isRequired).toBe(false);
  });

  it("creates COMMON_GROUND (R4) item", () => {
    const item = ReflectionItem.create("COMMON_GROUND", "우리 모두 안전에 동의합니다");
    expect(item.type).toBe("COMMON_GROUND");
    expect(item.isRequired).toBe(false);
  });

  it("creates FUTURE_QUESTION (R5) item", () => {
    const item = ReflectionItem.create("FUTURE_QUESTION", "다음에 더 이야기하고 싶은 것은...");
    expect(item.type).toBe("FUTURE_QUESTION");
    expect(item.isRequired).toBe(false);
  });

  it("throws for SUMMARY with empty content", () => {
    expect(() => ReflectionItem.create("SUMMARY", "")).toThrow();
  });

  it("throws for ACCURACY_CHECK with empty content", () => {
    expect(() => ReflectionItem.create("ACCURACY_CHECK", "")).toThrow();
  });

  it("allows empty content for optional items", () => {
    const item = ReflectionItem.create("COMMON_GROUND", "");
    expect(item.content).toBe("");
  });

  it("has all 5 types defined", () => {
    expect(REFLECTION_TYPES).toHaveLength(5);
  });

  it("throws for invalid type", () => {
    expect(() => ReflectionItem.create("INVALID" as ReflectionType, "test")).toThrow();
  });
});
