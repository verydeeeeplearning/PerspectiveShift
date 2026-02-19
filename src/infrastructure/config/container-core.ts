import { Question, type QuestionProps } from "@/domain/entities/question";
import { QuestionBank } from "@/domain/entities/question-bank";
import type { PiiScrubber } from "@/domain/interfaces/pii-scrubber";
import type { LlmStanceExtractor } from "@/domain/interfaces/llm-stance-extractor";
import type { BaselineProvider } from "@/domain/interfaces/baseline-provider";
import type { StanceRepository } from "@/domain/interfaces/stance-repository";
import type { MatchRepository } from "@/domain/interfaces/match-repository";
import type { DialogueRepository } from "@/domain/interfaces/dialogue-repository";
import type { FeedbackRepository } from "@/domain/interfaces/feedback-repository";
import type { Facilitator } from "@/domain/interfaces/facilitator";
import type { SummaryGenerator } from "@/domain/interfaces/summary-generator";
import type { UserRepository } from "@/domain/interfaces/user-repository";
import type { FriendRepository } from "@/domain/interfaces/friend-repository";
import type { FriendshipRepository } from "@/domain/interfaces/friendship-repository";
import type { DisclosureRepository } from "@/domain/interfaces/disclosure-repository";
import type { BlockRepository } from "@/domain/interfaces/block-repository";
import type { SafetyRepository } from "@/domain/interfaces/safety-repository";
import type { MessageRepository } from "@/domain/interfaces/message-repository";
import type { ReceiptRepository } from "@/domain/interfaces/receipt-repository";
import type { RealtimeBroadcaster } from "@/domain/interfaces/realtime-broadcaster";
import type { RateLimiter } from "@/domain/interfaces/rate-limiter";
import type { MeetingRepository } from "@/domain/interfaces/meeting-repository";
import type { EventTracker } from "@/domain/interfaces/event-tracker";
import type { ValueExtractor } from "@/domain/interfaces/value-extractor";
import type { ReceptivenessRepository } from "@/domain/interfaces/receptiveness-repository";
import type { FollowUpCheckinRepository } from "@/domain/interfaces/follow-up-checkin-repository";
import type { LightProtocolRepository } from "@/domain/interfaces/light-protocol-repository";
import type { PersonaRepository } from "@/domain/interfaces/persona-repository";
import type { PersonaDialogueGenerator } from "@/domain/interfaces/persona-dialogue-generator";
import type { TextSegmenter } from "@/domain/interfaces/text-segmenter";
import type { TrailerGenerator } from "@/domain/interfaces/trailer-generator";
import type { DialogueAgent } from "@/domain/interfaces/dialogue-agent";
import type { QuestionType } from "@/domain/value-objects/question-type";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";
import { QuestionItem } from "@/domain/value-objects/question-item";
import { RegexPiiScrubber } from "../external/regex-pii-scrubber";
import { OpenAiStanceExtractor } from "../external/openai-stance-extractor";
import { KgssBaselineProvider } from "../external/kgss-baseline-provider";
import { OpenAiFacilitator } from "../external/openai-facilitator";
import { OpenAiSummaryGenerator } from "../external/openai-summary-generator";
import { FallbackFacilitator } from "../external/fallback-facilitator";
import { FallbackSummaryGenerator } from "../external/fallback-summary-generator";
import { SupabaseRealtimeBroadcaster } from "../external/supabase-realtime-broadcaster";
import { InMemoryRateLimiter } from "../external/in-memory-rate-limiter";
import { OpenAIValueExtractor } from "../external/openai-value-extractor";
import { FallbackValueExtractor } from "../external/fallback-value-extractor";
import { PersonaLlmAdapter } from "../external/persona-llm-adapter";
import { OpenAiPersonaGenerator } from "../external/openai-persona-generator";
import { KoreanTextSegmenter } from "../external/korean-text-segmenter";
import { FallbackTrailerGenerator } from "../external/fallback-trailer-generator";
import { OpenAiTrailerGenerator } from "../external/openai-trailer-generator";
import { initLangSmithTracing } from "../external/langsmith-tracer";
import {
  LangGraphDialogueAgent,
  FallbackDialogueAgent,
} from "../agent/dialogue-agent-graph";
import { SupabaseStanceRepository } from "../persistence/supabase-stance-repository";
import { SupabaseMatchRepository } from "../persistence/supabase-match-repository";
import { SupabaseDialogueRepository } from "../persistence/supabase-dialogue-repository";
import { SupabaseFeedbackRepository } from "../persistence/supabase-feedback-repository";
import { SupabaseUserRepository } from "../persistence/supabase-user-repository";
import { SupabaseFriendRepository } from "../persistence/supabase-friend-repository";
import { SupabaseFriendshipRepository } from "../persistence/supabase-friendship-repository";
import { SupabaseDisclosureRepository } from "../persistence/supabase-disclosure-repository";
import { SupabaseBlockRepository } from "../persistence/supabase-block-repository";
import { SupabaseSafetyRepository } from "../persistence/supabase-safety-repository";
import { SupabaseMessageRepository } from "../persistence/supabase-message-repository";
import { SupabaseReceiptRepository } from "../persistence/supabase-receipt-repository";
import { SupabaseMeetingRepository } from "../persistence/supabase-meeting-repository";
import { SupabaseEventRepository } from "../persistence/supabase-event-repository";
import { InMemoryPersonaRepository } from "../persistence/in-memory-persona-repository";
import { InMemorySavedPersonaRepository } from "../persistence/in-memory-saved-persona-repository";
import { InMemoryTuringGuessRepository } from "../persistence/in-memory-turing-guess-repository";
import { getSupabaseClient } from "../persistence/supabase-client";
import questionsData from "../external/data/questions.json";
import {
  stubReceptivenessRepo,
  stubLightProtocolRepo,
  stubFollowUpRepo,
} from "./stub-repositories";

function loadQuestions(): Question[] {
  return questionsData.map((q) => Question.create(q as QuestionProps));
}

function loadQuestionBank(): QuestionBank {
  const items = questionsData.map((q) =>
    QuestionItem.create({
      id: String(q.id),
      text: q.text,
      type: q.type as QuestionType,
      axis: q.dimension as StanceDimension,
      isAnchor: q.phase === "core",
      allowUncertain: q.type === "RUBRIC",
      tooltipText:
        q.id === 4 || q.id === 9
          ? "왜 묻는지: 매칭 시 대화 난이도를 조절하는 데 사용됩니다."
          : undefined,
    }),
  );
  return QuestionBank.create(items);
}

function createFallbackExtractor(): LlmStanceExtractor {
  return {
    async extract() {
      return { axes: {}, reasoning: "", readiness: 0.5 };
    },
  };
}

export function createCoreDependencies() {
  const piiScrubber: PiiScrubber = new RegexPiiScrubber();
  const openaiKey = process.env.OPENAI_API_KEY;
  const hasValidKey =
    openaiKey && !openaiKey.includes("your-") && openaiKey.length > 20;
  const llmExtractor: LlmStanceExtractor = hasValidKey
    ? new OpenAiStanceExtractor(openaiKey)
    : createFallbackExtractor();
  const baselineProvider: BaselineProvider = new KgssBaselineProvider();
  const supabase = getSupabaseClient();
  const stanceRepository: StanceRepository = new SupabaseStanceRepository(
    supabase,
  );
  const questions = loadQuestions();
  const matchRepository: MatchRepository = new SupabaseMatchRepository(
    supabase,
  );
  const dialogueRepository: DialogueRepository = new SupabaseDialogueRepository(
    supabase,
  );
  const feedbackRepository: FeedbackRepository = new SupabaseFeedbackRepository(
    supabase,
  );
  const facilitator: Facilitator = hasValidKey
    ? new OpenAiFacilitator(openaiKey)
    : new FallbackFacilitator();
  const summaryGenerator: SummaryGenerator = hasValidKey
    ? new OpenAiSummaryGenerator(openaiKey)
    : new FallbackSummaryGenerator();
  const userRepository: UserRepository = new SupabaseUserRepository(supabase);
  const friendRepository: FriendRepository = new SupabaseFriendRepository(
    supabase,
  );
  const friendshipRepository: FriendshipRepository =
    new SupabaseFriendshipRepository(supabase);
  const disclosureRepository: DisclosureRepository =
    new SupabaseDisclosureRepository(supabase);
  const blockRepository: BlockRepository = new SupabaseBlockRepository(
    supabase,
  );
  const safetyRepository: SafetyRepository = new SupabaseSafetyRepository(
    supabase,
  );
  const messageRepository: MessageRepository = new SupabaseMessageRepository(
    supabase,
  );
  const receiptRepository: ReceiptRepository = new SupabaseReceiptRepository(
    supabase,
  );
  const meetingRepository: MeetingRepository = new SupabaseMeetingRepository(
    supabase,
  );
  const realtimeBroadcaster: RealtimeBroadcaster =
    new SupabaseRealtimeBroadcaster(supabase);
  const rateLimiter: RateLimiter = new InMemoryRateLimiter();
  const eventTracker: EventTracker = new SupabaseEventRepository(supabase);
  const valueExtractor: ValueExtractor = hasValidKey
    ? new OpenAIValueExtractor(openaiKey)
    : new FallbackValueExtractor();
  const personaRepository: PersonaRepository = new InMemoryPersonaRepository();
  const personaDialogueGenerator: PersonaDialogueGenerator = hasValidKey
    ? new OpenAiPersonaGenerator(openaiKey)
    : new PersonaLlmAdapter();
  const savedPersonaRepository = new InMemorySavedPersonaRepository();
  const turingGuessRepository = new InMemoryTuringGuessRepository();
  const resolveActualSpeaker = async (
    dialogueSessionId: string,
  ): Promise<"human" | "ai"> =>
    dialogueSessionId.startsWith("agent-") ||
    dialogueSessionId.startsWith("ai-")
      ? "ai"
      : "human";

  const receptivenessRepository: ReceptivenessRepository =
    stubReceptivenessRepo;
  const followUpRepository: FollowUpCheckinRepository = stubFollowUpRepo;
  const lightProtocolRepository: LightProtocolRepository =
    stubLightProtocolRepo;
  const questionBank = loadQuestionBank();
  const textSegmenter: TextSegmenter = new KoreanTextSegmenter();
  const trailerGenerator: TrailerGenerator = hasValidKey
    ? new OpenAiTrailerGenerator(openaiKey)
    : new FallbackTrailerGenerator();
  const dialogueAgent: DialogueAgent = hasValidKey
    ? new LangGraphDialogueAgent(openaiKey)
    : new FallbackDialogueAgent();

  return {
    piiScrubber,
    llmExtractor,
    baselineProvider,
    stanceRepository,
    questions,
    matchRepository,
    dialogueRepository,
    feedbackRepository,
    facilitator,
    summaryGenerator,
    userRepository,
    friendRepository,
    friendshipRepository,
    disclosureRepository,
    blockRepository,
    safetyRepository,
    messageRepository,
    receiptRepository,
    meetingRepository,
    realtimeBroadcaster,
    rateLimiter,
    eventTracker,
    valueExtractor,
    receptivenessRepository,
    followUpRepository,
    lightProtocolRepository,
    questionBank,
    personaRepository,
    personaDialogueGenerator,
    savedPersonaRepository,
    turingGuessRepository,
    resolveActualSpeaker,
    textSegmenter,
    trailerGenerator,
    dialogueAgent,
    langSmithStatus: initLangSmithTracing(),
  };
}

export type CoreDependencies = ReturnType<typeof createCoreDependencies>;
