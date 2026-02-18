import { describe, it, expect } from "vitest";
import { SummaryCard } from "../summary-card";

describe("SummaryCard", () => {
  it("creates with all fields", () => {
    const card = SummaryCard.create({
      id: "sc-1",
      sessionId: "s-1",
      keyArguments: {
        participantA: ["AI should be regulated"],
        participantB: ["Innovation needs freedom"],
      },
      commonGround: ["Both value safety"],
      unresolvedQuestions: ["What counts as regulation?"],
      blindSpots: ["Neither addressed international coordination"],
      createdAt: new Date(),
    });

    expect(card.keyArguments.participantA).toHaveLength(1);
    expect(card.keyArguments.participantB).toHaveLength(1);
    expect(card.commonGround).toHaveLength(1);
    expect(card.unresolvedQuestions).toHaveLength(1);
    expect(card.blindSpots).toHaveLength(1);
  });

  it("creates defensive copies of arrays", () => {
    const args = { participantA: ["a"], participantB: ["b"] };
    const common = ["c"];
    const card = SummaryCard.create({
      id: "sc-1",
      sessionId: "s-1",
      keyArguments: args,
      commonGround: common,
      unresolvedQuestions: [],
      blindSpots: [],
      createdAt: new Date(),
    });

    args.participantA.push("mutated");
    common.push("mutated");

    expect(card.keyArguments.participantA).toHaveLength(1);
    expect(card.commonGround).toHaveLength(1);
  });
});
