import { describe, it, expect, vi } from "vitest";
import { OnboardingSession } from "@/application/services/onboarding-session";
import { SubmitAnswerUseCase } from "@/application/use-cases/submit-answer";
import { ExtractStanceUseCase } from "@/application/use-cases/extract-stance";
import { GenerateThoughtMapUseCase } from "@/application/use-cases/generate-thought-map";
import { RegexPiiScrubber } from "@/infrastructure/external/regex-pii-scrubber";
import { KgssBaselineProvider } from "@/infrastructure/external/kgss-baseline-provider";
import { Question } from "@/domain/entities/question";
import type { StanceRepository, StanceProfile } from "@/domain/interfaces/stance-repository";
import type { LlmStanceExtractor } from "@/domain/interfaces/llm-stance-extractor";
import type { QuestionProps } from "@/domain/entities/question";
import questionsData from "@/infrastructure/external/data/questions.json";
const questions = questionsData.map((q) =>
  Question.create(q as QuestionProps),
);

function createInMemoryRepo(): StanceRepository & { store: Map<string, StanceProfile> } {
  const store = new Map<string, StanceProfile>();
  return {
    store,
    async save(profile) {
      store.set(profile.sessionId, profile);
    },
    async findBySessionId(sessionId) {
      return store.get(sessionId) ?? null;
    },
    async update() {},
  };
}

describe("Stance Discovery - Full Flow Integration", () => {
  it("completes core-only flow: answers → vector → thought map", async () => {
    const session = new OnboardingSession("integration-1");
    const submitUseCase = new SubmitAnswerUseCase();

    submitUseCase.execute(session, { questionId: 1, type: "OX", value: true });
    submitUseCase.execute(session, { questionId: 2, type: "OX", value: true });
    submitUseCase.execute(session, { questionId: 3, type: "OX", value: false });
    submitUseCase.execute(session, { questionId: 4, type: "RUBRIC", value: 4 });
    submitUseCase.execute(session, { questionId: 5, type: "RUBRIC", value: 5 });

    expect(session.isCoreComplete()).toBe(true);
    session.transitionToInitialResult();

    const extractUseCase = new ExtractStanceUseCase({
      piiScrubber: new RegexPiiScrubber(),
      llmExtractor: { async extract() { return { axes: {}, reasoning: "", readiness: 0.5 }; } },
      questions,
    });

    const stanceResult = await extractUseCase.execute(
      "integration-1",
      session.getCoreAnswers(),
    );

    expect(stanceResult.precision).toBe("initial");
    expect(stanceResult.vector.TECH_REGULATION).toBe(1);
    expect(stanceResult.vector.REDISTRIBUTION).toBe(1);
    expect(stanceResult.vector.MERITOCRACY).toBe(-1);

    const repo = createInMemoryRepo();
    const generateUseCase = new GenerateThoughtMapUseCase({
      baselineProvider: new KgssBaselineProvider(),
      stanceRepository: repo,
    });

    const thoughtMap = await generateUseCase.execute(stanceResult);

    expect(thoughtMap.sessionId).toBe("integration-1");
    expect(thoughtMap.mapType.alias).toBeDefined();
    expect(thoughtMap.percentiles).toHaveLength(6);
    expect(thoughtMap.precision).toBe("initial");
    expect(repo.store.size).toBe(1);
  });

  it("completes extended flow with LLM extraction", async () => {
    const session = new OnboardingSession("integration-2");
    const submitUseCase = new SubmitAnswerUseCase();

    for (let i = 1; i <= 3; i++) {
      submitUseCase.execute(session, { questionId: i, type: "OX", value: true });
    }
    submitUseCase.execute(session, { questionId: 4, type: "RUBRIC", value: 3 });
    submitUseCase.execute(session, { questionId: 5, type: "RUBRIC", value: 3 });

    session.transitionToInitialResult();
    session.transitionToExtended();

    submitUseCase.execute(session, { questionId: 6, type: "OX", value: true });
    submitUseCase.execute(session, { questionId: 7, type: "RUBRIC", value: 4 });
    submitUseCase.execute(session, { questionId: 8, type: "RUBRIC", value: 2 });
    submitUseCase.execute(session, {
      questionId: 9,
      type: "OPEN_ENDED",
      value: "교육 기회의 평등이 가장 시급합니다",
    });
    submitUseCase.execute(session, {
      questionId: 10,
      type: "OPEN_ENDED",
      value: "상대방의 경험을 먼저 이해하려는 자세가 중요합니다",
    });

    const mockLlm: LlmStanceExtractor = {
      extract: vi.fn().mockResolvedValue({
        axes: { OPPORTUNITY_EQUALITY: 0.8, REDISTRIBUTION: 0.3 },
        reasoning: "교육 기회 균등과 사회적 재분배에 높은 관심",
        readiness: 0.85,
      }),
    };

    const piiScrubber = new RegexPiiScrubber();
    const extractUseCase = new ExtractStanceUseCase({
      piiScrubber,
      llmExtractor: mockLlm,
      questions,
    });

    const allAnswers = [
      ...session.getCoreAnswers(),
      ...session.getExtendedAnswers(),
    ];
    const stanceResult = await extractUseCase.execute(
      "integration-2",
      allAnswers,
    );

    expect(stanceResult.precision).toBe("refined");
    expect(stanceResult.reasoning).toBe(
      "교육 기회 균등과 사회적 재분배에 높은 관심",
    );
    expect(stanceResult.readiness).toBe(0.85);
    expect(mockLlm.extract).toHaveBeenCalledTimes(1);
  });

  it("PII is scrubbed before LLM in extended flow", async () => {
    const session = new OnboardingSession("integration-pii");
    const submitUseCase = new SubmitAnswerUseCase();

    for (let i = 1; i <= 3; i++) {
      submitUseCase.execute(session, { questionId: i, type: "OX", value: true });
    }
    submitUseCase.execute(session, { questionId: 4, type: "RUBRIC", value: 3 });
    submitUseCase.execute(session, { questionId: 5, type: "RUBRIC", value: 3 });
    submitUseCase.execute(session, {
      questionId: 9,
      type: "OPEN_ENDED",
      value: "제 전화번호는 010-1234-5678이고 email은 test@test.com입니다",
    });

    let capturedInput: unknown = null;
    const mockLlm: LlmStanceExtractor = {
      extract: vi.fn().mockImplementation((inputs) => {
        capturedInput = inputs;
        return { axes: {}, reasoning: "", readiness: 0.5 };
      }),
    };

    const extractUseCase = new ExtractStanceUseCase({
      piiScrubber: new RegexPiiScrubber(),
      llmExtractor: mockLlm,
      questions,
    });

    await extractUseCase.execute(
      "integration-pii",
      [...session.getCoreAnswers(), ...session.getExtendedAnswers()],
    );

    const inputs = capturedInput as { scrubbedText: string }[];
    expect(inputs[0].scrubbedText).not.toContain("010-1234-5678");
    expect(inputs[0].scrubbedText).not.toContain("test@test.com");
    expect(inputs[0].scrubbedText).toContain("[전화번호]");
    expect(inputs[0].scrubbedText).toContain("[이메일]");
  });
});
