import { describe, it, expect } from "vitest";
import {
  LIGHT_PROTOCOL_TYPES,
  LIGHT_PROTOCOL_META,
  isValidLightProtocolType,
} from "../light-protocol-type";

describe("LightProtocolType", () => {
  it("defines 3 protocol types", () => {
    expect(LIGHT_PROTOCOL_TYPES).toHaveLength(3);
    expect(LIGHT_PROTOCOL_TYPES).toContain("COMMON_GROUND");
    expect(LIGHT_PROTOCOL_TYPES).toContain("JOINT_QUESTION");
    expect(LIGHT_PROTOCOL_TYPES).toContain("SWITCH_SIDES");
  });

  describe("LIGHT_PROTOCOL_META", () => {
    it("COMMON_GROUND is 3 minutes with 3 required fields", () => {
      const meta = LIGHT_PROTOCOL_META.COMMON_GROUND;
      expect(meta.name).toBe("Common Ground Check");
      expect(meta.durationMinutes).toBe(3);
      expect(meta.requiredFields).toEqual([
        "agreedPoint",
        "differentPoint",
        "curiousPoint",
      ]);
    });

    it("JOINT_QUESTION is 5 minutes with 1 required field", () => {
      const meta = LIGHT_PROTOCOL_META.JOINT_QUESTION;
      expect(meta.name).toBe("Joint Question");
      expect(meta.durationMinutes).toBe(5);
      expect(meta.requiredFields).toEqual(["proposedQuestion"]);
    });

    it("SWITCH_SIDES is 5 minutes with 1 required field", () => {
      const meta = LIGHT_PROTOCOL_META.SWITCH_SIDES;
      expect(meta.name).toBe("Switch Sides Mini");
      expect(meta.durationMinutes).toBe(5);
      expect(meta.requiredFields).toEqual(["switchedPerspective"]);
    });

    it("each type has a description", () => {
      for (const type of LIGHT_PROTOCOL_TYPES) {
        expect(LIGHT_PROTOCOL_META[type].description).toBeTruthy();
      }
    });
  });

  describe("isValidLightProtocolType", () => {
    it("returns true for valid types", () => {
      expect(isValidLightProtocolType("COMMON_GROUND")).toBe(true);
      expect(isValidLightProtocolType("JOINT_QUESTION")).toBe(true);
      expect(isValidLightProtocolType("SWITCH_SIDES")).toBe(true);
    });

    it("returns false for invalid types", () => {
      expect(isValidLightProtocolType("INVALID")).toBe(false);
      expect(isValidLightProtocolType("")).toBe(false);
    });
  });
});
