import { describe, it, expect } from "vitest";
import { InMemoryPersonaRepository } from "../in-memory-persona-repository";

describe("InMemoryPersonaRepository", () => {
  const repo = new InMemoryPersonaRepository();

  describe("findAll", () => {
    it("returns 3 seed personas", async () => {
      const personas = await repo.findAll();
      expect(personas).toHaveLength(3);
    });

    it("each persona has required fields", async () => {
      const personas = await repo.findAll();
      for (const p of personas) {
        expect(p.id).toBeTruthy();
        expect(p.name).toBeTruthy();
        expect(p.ageGroup).toBeTruthy();
        expect(p.jobCategory).toBeTruthy();
        expect(p.stanceLabel).toBeTruthy();
        expect(p.description).toBeTruthy();
        expect(p.conversationStyle).toBeTruthy();
        expect(p.stanceVector).toBeDefined();
        expect(p.experienceBank.length).toBeGreaterThan(0);
      }
    });
  });

  describe("findById", () => {
    it("returns correct persona by id", async () => {
      const all = await repo.findAll();
      for (const persona of all) {
        const found = await repo.findById(persona.id);
        expect(found).not.toBeNull();
        expect(found!.id).toBe(persona.id);
        expect(found!.name).toBe(persona.name);
      }
    });

    it("returns null for unknown id", async () => {
      const result = await repo.findById("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("seed data correctness", () => {
    it("contains 현실주의 직장인 persona", async () => {
      const all = await repo.findAll();
      const realist = all.find((p) => p.name === "현실주의 직장인");
      expect(realist).toBeDefined();
      expect(realist!.ageGroup).toBe("30대");
      expect(realist!.jobCategory).toBe("IT직군");
      expect(realist!.conversationStyle).toBe("logical");
    });

    it("contains 공감하는 교육자 persona", async () => {
      const all = await repo.findAll();
      const educator = all.find((p) => p.name === "공감하는 교육자");
      expect(educator).toBeDefined();
      expect(educator!.ageGroup).toBe("40대");
      expect(educator!.jobCategory).toBe("교육직");
      expect(educator!.conversationStyle).toBe("emotional");
    });

    it("contains 탐구하는 대학생 persona", async () => {
      const all = await repo.findAll();
      const student = all.find((p) => p.name === "탐구하는 대학생");
      expect(student).toBeDefined();
      expect(student!.ageGroup).toBe("20대");
      expect(student!.jobCategory).toBe("학생");
      expect(student!.conversationStyle).toBe("careful");
    });
  });
});
