import { describe, it, expect } from "vitest";
import { PersonaProfile } from "../persona-profile";
import { StanceVector } from "../stance-vector";

function makeValidProps() {
  return {
    id: "persona-1",
    name: "현실주의 직장인",
    ageGroup: "30대",
    jobCategory: "IT직군",
    stanceLabel: "경제 보수",
    description: "실용적 관점에서 경제 정책을 바라봅니다.",
    conversationStyle: "logical" as const,
    stanceVector: StanceVector.fromValues({
      TECH_REGULATION: -0.3,
      REDISTRIBUTION: -0.5,
      WORK_LIFE: -0.2,
      MERITOCRACY: 0.7,
      TECH_OPTIMISM: 0.6,
      OPPORTUNITY_EQUALITY: -0.3,
    }),
    experienceBank: [
      "IT 업계에서 10년째 일하고 있습니다.",
      "세금이 오르면 투자가 줄어든다고 생각합니다.",
    ],
  };
}

describe("PersonaProfile", () => {
  describe("create", () => {
    it("creates a valid PersonaProfile with all props", () => {
      const props = makeValidProps();
      const persona = PersonaProfile.create(props);

      expect(persona.id).toBe("persona-1");
      expect(persona.name).toBe("현실주의 직장인");
      expect(persona.ageGroup).toBe("30대");
      expect(persona.jobCategory).toBe("IT직군");
      expect(persona.stanceLabel).toBe("경제 보수");
      expect(persona.description).toBe(
        "실용적 관점에서 경제 정책을 바라봅니다.",
      );
      expect(persona.conversationStyle).toBe("logical");
      expect(persona.stanceVector).toBe(props.stanceVector);
    });

    it("throws on empty id", () => {
      const props = makeValidProps();
      props.id = "";
      expect(() => PersonaProfile.create(props)).toThrow(
        "PersonaProfile id must not be empty",
      );
    });

    it("throws on whitespace-only id", () => {
      const props = makeValidProps();
      props.id = "   ";
      expect(() => PersonaProfile.create(props)).toThrow(
        "PersonaProfile id must not be empty",
      );
    });

    it("throws on empty name", () => {
      const props = makeValidProps();
      props.name = "";
      expect(() => PersonaProfile.create(props)).toThrow(
        "PersonaProfile name must not be empty",
      );
    });

    it("throws on whitespace-only name", () => {
      const props = makeValidProps();
      props.name = "   ";
      expect(() => PersonaProfile.create(props)).toThrow(
        "PersonaProfile name must not be empty",
      );
    });
  });

  describe("experienceBank immutability", () => {
    it("returns a frozen experienceBank array", () => {
      const props = makeValidProps();
      const persona = PersonaProfile.create(props);

      expect(Object.isFrozen(persona.experienceBank)).toBe(true);
    });

    it("does not reflect mutations to the original array", () => {
      const props = makeValidProps();
      const original = [...props.experienceBank];
      const persona = PersonaProfile.create(props);

      props.experienceBank.push("new item");

      expect(persona.experienceBank).toHaveLength(original.length);
      expect(persona.experienceBank).toEqual(original);
    });
  });
});
