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
import { ClaimSessionUseCase } from "@/application/use-cases/claim-session";
import { RequestFriendshipUseCase } from "@/application/use-cases/request-friendship";
import { RespondToFriendRequestUseCase } from "@/application/use-cases/respond-to-friend-request";
import { ListFriendsUseCase } from "@/application/use-cases/list-friends";
import { UnfriendUseCase } from "@/application/use-cases/unfriend";
import { UpdateDisclosureLevelUseCase } from "@/application/use-cases/update-disclosure-level";
import { GetDisclosureLevelsUseCase } from "@/application/use-cases/get-disclosure-levels";
import { SubmitSafetyReportUseCase } from "@/application/use-cases/submit-safety-report";
import { BlockUserUseCase } from "@/application/use-cases/block-user";
import { UnblockUserUseCase } from "@/application/use-cases/unblock-user";
import { SendChatMessageUseCase } from "@/application/use-cases/send-chat-message";
import { GetChatHistoryUseCase } from "@/application/use-cases/get-chat-history";
import { MarkMessagesReadUseCase } from "@/application/use-cases/mark-messages-read";
import { CreateOfflineProposalUseCase } from "@/application/use-cases/create-offline-proposal";
import { RespondToOfflineProposalUseCase } from "@/application/use-cases/respond-to-offline-proposal";
import { SubmitSafetyCheckinUseCase } from "@/application/use-cases/submit-safety-checkin";
import questionsData from "../external/data/questions.json";
import type { QuestionProps } from "@/domain/entities/question";

function loadQuestions(): Question[] {
  return questionsData.map((q) => Question.create(q as QuestionProps));
}

export interface Container {
  piiScrubber: PiiScrubber;
  llmExtractor: LlmStanceExtractor;
  baselineProvider: BaselineProvider;
  stanceRepository: StanceRepository;
  questions: Question[];
  submitAnswerUseCase: SubmitAnswerUseCase;
  extractStanceUseCase: ExtractStanceUseCase;
  generateThoughtMapUseCase: GenerateThoughtMapUseCase;
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
  userRepository: UserRepository;
  friendRepository: FriendRepository;
  friendshipRepository: FriendshipRepository;
  disclosureRepository: DisclosureRepository;
  blockRepository: BlockRepository;
  claimSessionUseCase: ClaimSessionUseCase;
  requestFriendshipUseCase: RequestFriendshipUseCase;
  respondToFriendRequestUseCase: RespondToFriendRequestUseCase;
  listFriendsUseCase: ListFriendsUseCase;
  unfriendUseCase: UnfriendUseCase;
  updateDisclosureLevelUseCase: UpdateDisclosureLevelUseCase;
  getDisclosureLevelsUseCase: GetDisclosureLevelsUseCase;
  messageRepository: MessageRepository;
  receiptRepository: ReceiptRepository;
  realtimeBroadcaster: RealtimeBroadcaster;
  rateLimiter: RateLimiter;
  sendChatMessageUseCase: SendChatMessageUseCase;
  getChatHistoryUseCase: GetChatHistoryUseCase;
  markMessagesReadUseCase: MarkMessagesReadUseCase;
  safetyRepository: SafetyRepository;
  submitSafetyReportUseCase: SubmitSafetyReportUseCase;
  blockUserUseCase: BlockUserUseCase;
  unblockUserUseCase: UnblockUserUseCase;
  meetingRepository: MeetingRepository;
  eventTracker: EventTracker;
  createOfflineProposalUseCase: CreateOfflineProposalUseCase;
  respondToOfflineProposalUseCase: RespondToOfflineProposalUseCase;
  submitSafetyCheckinUseCase: SubmitSafetyCheckinUseCase;
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
  const receiptRepository = new SupabaseReceiptRepository(supabase);
  const meetingRepository = new SupabaseMeetingRepository(supabase);
  const realtimeBroadcaster = new SupabaseRealtimeBroadcaster(supabase);
  const rateLimiter = new InMemoryRateLimiter();
  const eventTracker = new SupabaseEventRepository(supabase);

  container = {
    piiScrubber,
    llmExtractor,
    baselineProvider,
    stanceRepository,
    questions,
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
