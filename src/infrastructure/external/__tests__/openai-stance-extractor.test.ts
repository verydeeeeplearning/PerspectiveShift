import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenAiStanceExtractor } from "../openai-stance-extractor";

vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    axes: {
                      TECH_REGULATION: 0.5,
                      REDISTRIBUTION: -0.3,
                      OPPORTUNITY_EQUALITY: 0.7,
                    },
                    reasoning: "기술 규제 강화와 기회 균등에 관심이 높음",
                    readiness: 0.8,
                  }),
                },
              },
            ],
          }),
        },
      },
    })),
  };
});

describe("OpenAiStanceExtractor", () => {
  let extractor: OpenAiStanceExtractor;

  beforeEach(() => {
    extractor = new OpenAiStanceExtractor("test-key");
  });

  it("extracts stance axes from LLM response", async () => {
    const result = await extractor.extract([
      { questionId: 9, scrubbedText: "교육 기회의 평등이 중요합니다" },
    ]);

    expect(result.axes.TECH_REGULATION).toBe(0.5);
    expect(result.axes.REDISTRIBUTION).toBe(-0.3);
    expect(result.axes.OPPORTUNITY_EQUALITY).toBe(0.7);
  });

  it("returns reasoning in Korean", async () => {
    const result = await extractor.extract([
      { questionId: 9, scrubbedText: "test" },
    ]);
    expect(result.reasoning).toContain("기술 규제");
  });

  it("returns readiness score", async () => {
    const result = await extractor.extract([
      { questionId: 10, scrubbedText: "열린 마음으로 대화하겠습니다" },
    ]);
    expect(result.readiness).toBe(0.8);
  });

  it("handles empty response gracefully with fallback", async () => {
    const OpenAIMock = (await import("openai")).default;
    vi.mocked(OpenAIMock).mockImplementationOnce(
      () =>
        ({
          chat: {
            completions: {
              create: vi.fn().mockResolvedValue({
                choices: [{ message: { content: null } }],
              }),
            },
          },
        }) as unknown as InstanceType<typeof OpenAIMock>,
    );

    const emptyExtractor = new OpenAiStanceExtractor("test-key");
    const result = await emptyExtractor.extract([
      { questionId: 9, scrubbedText: "test" },
    ]);

    expect(result.axes).toEqual({});
    expect(result.reasoning).toBe("");
    expect(result.readiness).toBe(0.5);
  });

  it("filters out invalid axis values", async () => {
    const OpenAIMock = (await import("openai")).default;
    vi.mocked(OpenAIMock).mockImplementationOnce(
      () =>
        ({
          chat: {
            completions: {
              create: vi.fn().mockResolvedValue({
                choices: [
                  {
                    message: {
                      content: JSON.stringify({
                        axes: {
                          TECH_REGULATION: 1.5,
                          REDISTRIBUTION: null,
                          WORK_LIFE: 0.3,
                        },
                        reasoning: "분석",
                        readiness: 0.5,
                      }),
                    },
                  },
                ],
              }),
            },
          },
        }) as unknown as InstanceType<typeof OpenAIMock>,
    );

    const filterExtractor = new OpenAiStanceExtractor("test-key");
    const result = await filterExtractor.extract([
      { questionId: 9, scrubbedText: "test" },
    ]);

    expect(result.axes.TECH_REGULATION).toBeUndefined();
    expect(result.axes.REDISTRIBUTION).toBeUndefined();
    expect(result.axes.WORK_LIFE).toBe(0.3);
  });
});
