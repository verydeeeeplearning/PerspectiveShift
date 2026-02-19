import { describe, it, expect } from "vitest";
import { ExcludeDialogueFromRecordUseCase } from "../exclude-dialogue-from-record";

describe("ExcludeDialogueFromRecordUseCase", () => {
  const uc = new ExcludeDialogueFromRecordUseCase();

  it("marks dialogue as excluded", () => {
    const r = uc.execute({ dialogueId: "d-1" });
    expect(r.dialogueId).toBe("d-1");
    expect(r.excluded).toBe(true);
  });
});
