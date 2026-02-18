import { Question } from "@/domain/entities/question";
import type { PiiScrubber } from "@/domain/interfaces/pii-scrubber";
import type { LlmStanceExtractor } from "@/domain/interfaces/llm-stance-extractor";
import type { BaselineProvider } from "@/domain/interfaces/baseline-provider";
import type { StanceRepository } from "@/domain/interfaces/stance-repository";
import type { MatchRepository } from "@/domain/interfaces/match-repository";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { FeedbackRepository } from "@/domain/interfaces/feedback-repository";
import type { Facilitator } from "@/domain/interfaces/facilitator";
import type { SummaryGenerator } from "@/domain/interfaces/summary-generator";
import { RegexPiiScrubber } from "../external/regex-pii-scrubber";
import { OpenAiStanceExtractor } from "../external/openai-stance-extractor";
import { KgssBaselineProvider } from "../external/kgss-baseline-provider";
import { SupabaseStanceRepository } from "../persistence/supabase-stance-repository";
import { SupabaseMatchRepository } from "../persistence/supabase-match-repository";
import { SupabaseDialogueRepository } from "../persistence/supabase-dialogue-repository";
import { SupabaseFeedbackRepository } from "../persistence/supabase-feedback-repository";
import { OpenAiFacilitator } from "../external/openai-facilitator";
import { OpenAiSummaryGenerator } from "../external/openai-summary-generator";
import { FallbackFacilitator } from "../external/fallback-facilitator";
import { FallbackSummaryGenerator } from "../external/fallback-summary-generator";
import { getSupabaseClient } from "../persistence/supabase-client";
import { ExtractStanceUseCase } from "@/application/use-cases/extract-stance";
import { GenerateThoughtMapUseCase } from "@/application/use-cases/generate-thought-map";
import { SubmitAnswerUseCase } from "@/application/use-cases/submit-answer";
import { FindMatchCandidatesUseCase } from "@/application/use-cases/find-match-candidates";
import { CreateMatchProposalUseCase } from "@/application/use-cases/create-match-proposal";
import { RespondToProposalUseCase } from "@/application/use-cases/respond-to-proposal";
import { SubmitDialogueTurnUseCase } from "@/application/use-cases/submit-dialogue-turn";
import { GetDialogueSessionUseCase } from "@/application/use-cases/get-dialogue-session";
import { CheckExpiredSessionsUseCase } from "@/application/use-cases/check-expired-sessions";
import { SubmitFeedbackUseCase } from "@/application/use-cases/submit-feedback";
import { EvaluateUnderstandingUseCase } from "@/application/use-cases/evaluate-understanding";
import { GenerateSummaryCardUseCase } from "@/application/use-cases/generate-summary-card";
import questionsData from "../external/data/questions.json";
import type { QuestionProps } from "@/domain/entities/question";

function loadQuestions(): Question[] {
  return questionsData.map((q) =>
    Question.create(q as QuestionProps),
  );
}

export interface Container {
  // Phase 1
  piiScrubber: PiiScrubber;
  llmExtractor: LlmStanceExtractor;
  baselineProvider: BaselineProvider;
  stanceRepository: StanceRepository;
  questions: Question[];
  submitAnswerUseCase: SubmitAnswerUseCase;
  extractStanceUseCase: ExtractStanceUseCase;
  generateThoughtMapUseCase: GenerateThoughtMapUseCase;
  // Phase 2
  matchRepository: MatchRepository;
  dialogueRepository: DialogueRepository;
  feedbackRepository: FeedbackRepository;
  facilitator: Facilitator;
  summaryGenerator: SummaryGenerator;
  findMatchCandidatesUseCase: FindMatchCandidatesUseCase;
  createMatchProposalUseCase: CreateMatchProposalUseCase;
  respondToProposalUseCase: RespondToProposalUseCase;
  submitDialogueTurnUseCase: SubmitDialogueTurnUseCase;
  getDialogueSessionUseCase: GetDialogueSessionUseCase;
  checkExpiredSessionsUseCase: CheckExpiredSessionsUseCase;
  submitFeedbackUseCase: SubmitFeedbackUseCase;
  evaluateUnderstandingUseCase: EvaluateUnderstandingUseCase;
  generateSummaryCardUseCase: GenerateSummaryCardUseCase;
}

let container: Container | null = null;

export function getContainer(): Container {
  if (container) return container;

  const piiScrubber = new RegexPiiScrubber();
  const openaiKey = process.env.OPENAI_API_KEY;
  const hasValidKey = openaiKey && !openaiKey.includes("your-") && openaiKey.length > 20;
  const llmExtractor = hasValidKey
    ? new OpenAiStanceExtractor(openaiKey)
    : createFallbackExtractor();
  const baselineProvider = new KgssBaselineProvider();
  const supabase = getSupabaseClient();
  const stanceRepository = new SupabaseStanceRepository(supabase);
  const questions = loadQuestions();

  // Phase 2 repositories
  const matchRepository = new SupabaseMatchRepository(supabase);
  const dialogueRepository = new SupabaseDialogueRepository(supabase);
  const feedbackRepository = new SupabaseFeedbackRepository(supabase);

  // Phase 2 LLM adapters (with fallbacks)
  const facilitator = hasValidKey
    ? new OpenAiFacilitator(openaiKey)
    : new FallbackFacilitator();
  const summaryGenerator = hasValidKey
    ? new OpenAiSummaryGenerator(openaiKey)
    : new FallbackSummaryGenerator();

  container = {
    // Phase 1
    piiScrubber,
    llmExtractor,
    baselineProvider,
    stanceRepository,
    questions,
    submitAnswerUseCase: new SubmitAnswerUseCase(),
    extractStanceUseCase: new ExtractStanceUseCase({
      piiScrubber,
      llmExtractor,
      questions,
    }),
    generateThoughtMapUseCase: new GenerateThoughtMapUseCase({
      baselineProvider,
      stanceRepository,
    }),
    // Phase 2
    matchRepository,
    dialogueRepository,
    feedbackRepository,
    facilitator,
    summaryGenerator,
    findMatchCandidatesUseCase: new FindMatchCandidatesUseCase({
      stanceRepository,
      matchRepository,
    }),
    createMatchProposalUseCase: new CreateMatchProposalUseCase({
      stanceRepository,
      matchRepository,
    }),
    respondToProposalUseCase: new RespondToProposalUseCase({
      matchRepository,
      dialogueRepository,
    }),
    submitDialogueTurnUseCase: new SubmitDialogueTurnUseCase({
      dialogueRepository,
      piiScrubber,
      facilitator,
    }),
    getDialogueSessionUseCase: new GetDialogueSessionUseCase({
      dialogueRepository,
    }),
    checkExpiredSessionsUseCase: new CheckExpiredSessionsUseCase({
      dialogueRepository,
    }),
    submitFeedbackUseCase: new SubmitFeedbackUseCase({
      dialogueRepository,
      feedbackRepository,
    }),
    evaluateUnderstandingUseCase: new EvaluateUnderstandingUseCase({
      dialogueRepository,
      feedbackRepository,
      piiScrubber,
      summaryGenerator,
    }),
    generateSummaryCardUseCase: new GenerateSummaryCardUseCase({
      dialogueRepository,
      feedbackRepository,
      piiScrubber,
      summaryGenerator,
    }),
  };

  return container;
}

function createFallbackExtractor(): LlmStanceExtractor {
  return {
    async extract() {
      return { axes: {}, reasoning: "", readiness: 0.5 };
    },
  };
}

export function resetContainer(): void {
  container = null;
}
