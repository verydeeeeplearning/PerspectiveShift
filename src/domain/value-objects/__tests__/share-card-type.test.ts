import { describe, it, expect } from "vitest";
import {
  SHARE_CARD_TYPES,
  type ShareCardType,
  isValidShareCardType,
} from "../share-card-type";

describe("ShareCardType", () => {
  it("defines ALIAS type", () => {
    expect(SHARE_CARD_TYPES).toContain("ALIAS");
  });

  it("defines THOUGHT_MAP type", () => {
    expect(SHARE_CARD_TYPES).toContain("THOUGHT_MAP");
  });

  it("defines MISPERCEPTION type", () => {
    expect(SHARE_CARD_TYPES).toContain("MISPERCEPTION");
  });

  it("has exactly 3 types", () => {
    expect(SHARE_CARD_TYPES).toHaveLength(3);
  });

  it("validates valid type", () => {
    expect(isValidShareCardType("ALIAS")).toBe(true);
  });

  it("rejects invalid type", () => {
    expect(isValidShareCardType("UNKNOWN")).toBe(false);
  });
});
