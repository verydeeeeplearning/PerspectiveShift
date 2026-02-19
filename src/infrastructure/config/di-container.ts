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
import { SupabaseUserRepository } from "../persistence/supabase-user-repository";
import { SupabaseFriendRepository } from "../persistence/supabase-friend-repository";
import { SupabaseFriendshipRepository } from "../persistence/supabase-friendship-repository";
import { SupabaseDisclosureRepository } from "../persistence/supabase-disclosure-repository";
import { SupabaseBlockRepository } from "../persistence/supabase-block-repository";
import { SupabaseSafetyRepository } from "../persistence/supabase-safety-repository";
import { SupabaseMessageRepository } from "../persistence/supabase-message-repository";
import { SupabaseReceiptRepository } from "../persistence/supabase-receipt-repository";
import { SupabaseMeetingRepository } from "../persistence/supabase-meeting-repository";
import { SupabaseRealtimeBroadcaster } from "../external/supabase-realtime-broadcaster";
import { InMemoryRateLimiter } from "../external/in-memory-rate-limiter";
import { SupabaseEventRepository } from "../persistence/supabase-event-repository";
import { getSupabaseClient } from "../persistence/supabase-client";
import {
  ExtractStanceUseCase, GenerateThoughtMapUseCase, SubmitAnswerUseCase,
  FindMatchCandidatesUseCase, CreateMatchProposalUseCase, RespondToProposalUseCase,
  SubmitDialogueTurnUseCase, GetDialogueSessionUseCase, CheckExpiredSessionsUseCase,
  SubmitFeedbackUseCase, EvaluateUnderstandingUseCase, GenerateSummaryCardUseCase,
  ClaimSessionUseCase, RequestFriendshipUseCase, RespondToFriendRequestUseCase,
  ListFriendsUseCase, UnfriendUseCase, UpdateDisclosureLevelUseCase, GetDisclosureLevelsUseCase,
  SubmitSafetyReportUseCase, BlockUserUseCase, UnblockUserUseCase,
  SendChatMessageUseCase, GetChatHistoryUseCase, MarkMessagesReadUseCase,
  CreateOfflineProposalUseCase, RespondToOfflineProposalUseCase, SubmitSafetyCheckinUseCase,
  SubmitSelfAffirmationUseCase, SubmitConfidenceUseCase, CalculateMisperceptionUseCase,
  SubmitReflectionUseCase, GenerateJointSummaryUseCase,
  UpdateReceptivenessUseCase, ScheduleFollowUpUseCase, SubmitFollowUpCheckinUseCase,
  StartLightProtocolUseCase, SubmitLightProtocolUseCase, CheckRealtimeEligibilityUseCase,
  SelectOnboardingModeUseCase, CalculatePrecisionUseCase, CheckRetakeLimitUseCase,
  GenerateShareCardUseCase, DetermineNextStepUseCase, BuildMatchCardUseCase, SelectEnergyLevelUseCase, RecordDeclineReasonUseCase,
  GetScaffoldForStepUseCase, GetCoachSuggestionsUseCase, CreateHighlightUseCase, CheckToneUseCase, SuggestReceptivenessTemplateUseCase,
  GenerateReflectionQuizUseCase, SubmitQuizAnswerAndTextUseCase, SubmitMutualVerificationUseCase,
  SubmitRoleplaySteelmanUseCase, SaveCommonGroundUseCase, DetermineReflectionPolicyUseCase,
  BuildJointSummaryCardUseCase, WriteGiftMessageUseCase, RevealGiftMessageUseCase,
  ExtractBlindSpotUseCase, CollectPeakEndKPIUseCase, SaveNextQuestionUseCase,
  DetectBadExperienceUseCase, ApplyRecoveryRoutineUseCase, ExcludeDialogueFromRecordUseCase,
  DetermineHomeStateUseCase, GenerateReplayCardUseCase, UpdatePerspectivePassportUseCase,
  HandleThoughtChangeUseCase, BuildNotificationUseCase, ManageNotificationPreferenceUseCase,
  TrackEventUseCase, GetMicrocopyForContextUseCase, CheckFeatureFlagUseCase, GetExperimentVariantUseCase, CalculateStanceDriftUseCase, ManageDriftPreferenceUseCase, SendDriftNotificationUseCase,
  CheckMatchingPoolUseCase,
  SelectPersonaUseCase, GeneratePersonaResponseUseCase,
  SegmentTextUseCase, CreateHighlightByTapUseCase,
  GenerateConversationTrailerUseCase,
} from "@/application/use-cases";
import { stubReceptivenessRepo, stubLightProtocolRepo, stubFollowUpRepo } from "./stub-repositories";
import { InMemoryPersonaRepository } from "../persistence/in-memory-persona-repository";
import { PersonaLlmAdapter } from "../external/persona-llm-adapter";
import { KoreanTextSegmenter } from "../external/korean-text-segmenter";
import { FallbackTrailerGenerator } from "../external/fallback-trailer-generator";
import type { PersonaRepository } from "@/domain/interfaces/persona-repository";
import type { PersonaDialogueGenerator } from "@/domain/interfaces/persona-dialogue-generator";
import type { TextSegmenter } from "@/domain/interfaces/text-segmenter";
import type { TrailerGenerator } from "@/domain/interfaces/trailer-generator";
import { OpenAIValueExtractor } from "../external/openai-value-extractor";
import { FallbackValueExtractor } from "../external/fallback-value-extractor";
import { InMemoryEventEmitter } from "../external/in-memory-event-emitter";
import { QuestionBank } from "@/domain/entities/question-bank";
import { QuestionItem } from "@/domain/value-objects/question-item";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";
import type { QuestionType } from "@/domain/value-objects/question-type";
import questionsData from "../external/data/questions.json";
import type { QuestionProps } from "@/domain/entities/question";

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

function createContainer() {

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
  const matchRepository = new SupabaseMatchRepository(supabase);
  const dialogueRepository = new SupabaseDialogueRepository(supabase);
  const feedbackRepository = new SupabaseFeedbackRepository(supabase);
  const facilitator = hasValidKey ? new OpenAiFacilitator(openaiKey) : new FallbackFacilitator();
  const summaryGenerator = hasValidKey ? new OpenAiSummaryGenerator(openaiKey) : new FallbackSummaryGenerator();
  const userRepository = new SupabaseUserRepository(supabase);
  const friendRepository = new SupabaseFriendRepository(supabase);
  const friendshipRepository = new SupabaseFriendshipRepository(supabase);
  const disclosureRepository = new SupabaseDisclosureRepository(supabase);
  const blockRepository = new SupabaseBlockRepository(supabase);
  const safetyRepository = new SupabaseSafetyRepository(supabase);
  const messageRepository = new SupabaseMessageRepository(supabase);
  const receiptRepository = new SupabaseReceiptRepository(supabase); const meetingRepository = new SupabaseMeetingRepository(supabase);
  const realtimeBroadcaster = new SupabaseRealtimeBroadcaster(supabase);
  const rateLimiter = new InMemoryRateLimiter(); const eventTracker = new SupabaseEventRepository(supabase);
  const valueExtractor: ValueExtractor = hasValidKey
    ? new OpenAIValueExtractor(openaiKey)
    : new FallbackValueExtractor();

  return {
    piiScrubber, llmExtractor, baselineProvider, stanceRepository, questions,
    submitAnswerUseCase: new SubmitAnswerUseCase(),
    extractStanceUseCase: new ExtractStanceUseCase({ piiScrubber, llmExtractor, questions }),
    generateThoughtMapUseCase: new GenerateThoughtMapUseCase({ baselineProvider, stanceRepository }),
    matchRepository,
    dialogueRepository,
    feedbackRepository,
    facilitator,
    summaryGenerator,
    findMatchCandidatesUseCase: new FindMatchCandidatesUseCase({ stanceRepository, matchRepository }),
    createMatchProposalUseCase: new CreateMatchProposalUseCase({ stanceRepository, matchRepository }),
    respondToProposalUseCase: new RespondToProposalUseCase({ matchRepository, dialogueRepository }),
    submitDialogueTurnUseCase: new SubmitDialogueTurnUseCase({ dialogueRepository, piiScrubber, facilitator }),
    getDialogueSessionUseCase: new GetDialogueSessionUseCase({ dialogueRepository }),
    checkExpiredSessionsUseCase: new CheckExpiredSessionsUseCase({ dialogueRepository }),
    submitFeedbackUseCase: new SubmitFeedbackUseCase({ dialogueRepository, feedbackRepository }),
    evaluateUnderstandingUseCase: new EvaluateUnderstandingUseCase({
      dialogueRepository, feedbackRepository, piiScrubber, summaryGenerator,
    }),
    generateSummaryCardUseCase: new GenerateSummaryCardUseCase({
      dialogueRepository, feedbackRepository, piiScrubber, summaryGenerator,
    }),
    userRepository,
    friendRepository,
    friendshipRepository,
    disclosureRepository,
    blockRepository,
    claimSessionUseCase: new ClaimSessionUseCase({ userRepository }),
    requestFriendshipUseCase: new RequestFriendshipUseCase({ friendRepository, blockRepository, dialogueRepository, eventTracker }),
    respondToFriendRequestUseCase: new RespondToFriendRequestUseCase({ friendRepository, friendshipRepository, eventTracker }),
    listFriendsUseCase: new ListFriendsUseCase({ friendshipRepository }),
    unfriendUseCase: new UnfriendUseCase({ friendshipRepository }),
    updateDisclosureLevelUseCase: new UpdateDisclosureLevelUseCase({ disclosureRepository, friendshipRepository, eventTracker }),
    getDisclosureLevelsUseCase: new GetDisclosureLevelsUseCase({ disclosureRepository, friendshipRepository }),
    messageRepository,
    receiptRepository,
    realtimeBroadcaster,
    rateLimiter,
    sendChatMessageUseCase: new SendChatMessageUseCase({
      friendshipRepository, blockRepository, messageRepository, realtimeBroadcaster, rateLimiter, piiScrubber, eventTracker,
    }),
    getChatHistoryUseCase: new GetChatHistoryUseCase({ friendshipRepository, messageRepository }),
    markMessagesReadUseCase: new MarkMessagesReadUseCase({ messageRepository, receiptRepository }),
    safetyRepository,
    submitSafetyReportUseCase: new SubmitSafetyReportUseCase({ safetyRepository, eventTracker }),
    blockUserUseCase: new BlockUserUseCase({ blockRepository, friendshipRepository, eventTracker }),
    unblockUserUseCase: new UnblockUserUseCase({ blockRepository, eventTracker }),
    meetingRepository,
    eventTracker,
    createOfflineProposalUseCase: new CreateOfflineProposalUseCase({
      friendshipRepository, disclosureRepository, meetingRepository, eventTracker,
    }),
    respondToOfflineProposalUseCase: new RespondToOfflineProposalUseCase({ meetingRepository, friendshipRepository }),
    submitSafetyCheckinUseCase: new SubmitSafetyCheckinUseCase({ meetingRepository, friendshipRepository, eventTracker }),
    valueExtractor,
    submitSelfAffirmationUseCase: new SubmitSelfAffirmationUseCase(stanceRepository, valueExtractor),
    submitConfidenceUseCase: new SubmitConfidenceUseCase(stanceRepository),
    calculateMisperceptionUseCase: new CalculateMisperceptionUseCase({ baselineProvider }),
    submitReflectionUseCase: new SubmitReflectionUseCase({ dialogueRepository }),
    generateJointSummaryUseCase: new GenerateJointSummaryUseCase({
      dialogueRepository,
      summaryGenerator,
    }),
    receptivenessRepository: stubReceptivenessRepo,
    followUpRepository: stubFollowUpRepo,
    updateReceptivenessUseCase: new UpdateReceptivenessUseCase({ receptivenessRepository: stubReceptivenessRepo }),
    scheduleFollowUpUseCase: new ScheduleFollowUpUseCase({ followUpRepository: stubFollowUpRepo }),
    submitFollowUpCheckinUseCase: new SubmitFollowUpCheckinUseCase({ followUpRepository: stubFollowUpRepo }),
    lightProtocolRepository: stubLightProtocolRepo,
    startLightProtocolUseCase: new StartLightProtocolUseCase({ friendshipRepository, lightProtocolRepository: stubLightProtocolRepo }),
    submitLightProtocolUseCase: new SubmitLightProtocolUseCase({ friendshipRepository, lightProtocolRepository: stubLightProtocolRepo }),
    checkRealtimeEligibilityUseCase: new CheckRealtimeEligibilityUseCase({ friendshipRepository }),
    selectOnboardingModeUseCase: new SelectOnboardingModeUseCase({ questionBank: loadQuestionBank() }),
    calculatePrecisionUseCase: new CalculatePrecisionUseCase(), checkRetakeLimitUseCase: new CheckRetakeLimitUseCase(),
    generateShareCardUseCase: new GenerateShareCardUseCase(), determineNextStepUseCase: new DetermineNextStepUseCase(),
    buildMatchCardUseCase: new BuildMatchCardUseCase(), selectEnergyLevelUseCase: new SelectEnergyLevelUseCase(),
    recordDeclineReasonUseCase: new RecordDeclineReasonUseCase(), getScaffoldForStepUseCase: new GetScaffoldForStepUseCase(),
    getCoachSuggestionsUseCase: new GetCoachSuggestionsUseCase(), createHighlightUseCase: new CreateHighlightUseCase(),
    checkToneUseCase: new CheckToneUseCase(), suggestReceptivenessTemplateUseCase: new SuggestReceptivenessTemplateUseCase(),
    generateReflectionQuizUseCase: new GenerateReflectionQuizUseCase(), submitQuizAnswerUseCase: new SubmitQuizAnswerAndTextUseCase(),
    submitMutualVerificationUseCase: new SubmitMutualVerificationUseCase(), submitRoleplaySteelmanUseCase: new SubmitRoleplaySteelmanUseCase(),
    saveCommonGroundUseCase: new SaveCommonGroundUseCase(), determineReflectionPolicyUseCase: new DetermineReflectionPolicyUseCase(),
    buildJointSummaryCardUseCase: new BuildJointSummaryCardUseCase(), writeGiftMessageUseCase: new WriteGiftMessageUseCase(),
    revealGiftMessageUseCase: new RevealGiftMessageUseCase(), extractBlindSpotUseCase: new ExtractBlindSpotUseCase(),
    collectPeakEndKPIUseCase: new CollectPeakEndKPIUseCase(), saveNextQuestionUseCase: new SaveNextQuestionUseCase(),
    detectBadExperienceUseCase: new DetectBadExperienceUseCase(), applyRecoveryRoutineUseCase: new ApplyRecoveryRoutineUseCase(),
    excludeDialogueFromRecordUseCase: new ExcludeDialogueFromRecordUseCase(),
    determineHomeStateUseCase: new DetermineHomeStateUseCase(), generateReplayCardUseCase: new GenerateReplayCardUseCase(),
    updatePerspectivePassportUseCase: new UpdatePerspectivePassportUseCase(), handleThoughtChangeUseCase: new HandleThoughtChangeUseCase(),
    buildNotificationUseCase: new BuildNotificationUseCase(), manageNotificationPreferenceUseCase: new ManageNotificationPreferenceUseCase(),
    trackEventUseCase: new TrackEventUseCase({ eventEmitter: new InMemoryEventEmitter() }),
    getMicrocopyForContextUseCase: new GetMicrocopyForContextUseCase(), checkFeatureFlagUseCase: new CheckFeatureFlagUseCase(),
    getExperimentVariantUseCase: new GetExperimentVariantUseCase(), calculateStanceDriftUseCase: new CalculateStanceDriftUseCase(), manageDriftPreferenceUseCase: new ManageDriftPreferenceUseCase(), sendDriftNotificationUseCase: new SendDriftNotificationUseCase(),
    checkMatchingPoolUseCase: new CheckMatchingPoolUseCase(),
    personaRepository: new InMemoryPersonaRepository() as PersonaRepository,
    personaDialogueGenerator: new PersonaLlmAdapter() as PersonaDialogueGenerator,
    selectPersonaUseCase: new SelectPersonaUseCase(new InMemoryPersonaRepository()),
    generatePersonaResponseUseCase: new GeneratePersonaResponseUseCase({ personaRepository: new InMemoryPersonaRepository(), personaDialogueGenerator: new PersonaLlmAdapter() }),
    textSegmenter: new KoreanTextSegmenter() as TextSegmenter,
    segmentTextUseCase: new SegmentTextUseCase(new KoreanTextSegmenter()),
    createHighlightByTapUseCase: new CreateHighlightByTapUseCase(),
    trailerGenerator: new FallbackTrailerGenerator() as TrailerGenerator,
    generateConversationTrailerUseCase: new GenerateConversationTrailerUseCase({ trailerGenerator: new FallbackTrailerGenerator() }),
  };
}

export type Container = ReturnType<typeof createContainer>;

let container: Container | null = null;

export function getContainer(): Container {
  if (!container) {
    container = createContainer();
  }
  return container;
}

function createFallbackExtractor(): LlmStanceExtractor {
  return { async extract() { return { axes: {}, reasoning: "", readiness: 0.5 }; } };
}

export function resetContainer(): void { container = null; }
