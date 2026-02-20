import {
  BlockUserUseCase,
  CalculateMisperceptionUseCase,
  SubmitAgentDialogueTurnUseCase,
  CheckExpiredSessionsUseCase,
  CheckRealtimeEligibilityUseCase,
  ClaimSessionUseCase,
  CreateAgentDialogueSessionUseCase,
  CreateMatchProposalUseCase,
  CreateOfflineProposalUseCase,
  EvaluateUnderstandingUseCase,
  ExtractStanceUseCase,
  FindMatchCandidatesUseCase,
  GenerateJointSummaryUseCase,
  GenerateSummaryCardUseCase,
  GenerateThoughtMapUseCase,
  GetChatHistoryUseCase,
  GetDialogueSessionUseCase,
  GetDisclosureLevelsUseCase,
  ListFriendsUseCase,
  MarkMessagesReadUseCase,
  RequestFriendshipUseCase,
  RespondToFriendRequestUseCase,
  RespondToOfflineProposalUseCase,
  RespondToProposalUseCase,
  ScheduleFollowUpUseCase,
  SendChatMessageUseCase,
  StartLightProtocolUseCase,
  SubmitAnswerUseCase,
  SubmitConfidenceUseCase,
  SubmitDialogueTurnUseCase,
  SubmitFeedbackUseCase,
  SubmitFollowUpCheckinUseCase,
  SubmitLightProtocolUseCase,
  SubmitReflectionUseCase,
  SubmitSafetyCheckinUseCase,
  SubmitSafetyReportUseCase,
  SubmitSelfAffirmationUseCase,
  UnblockUserUseCase,
  UnfriendUseCase,
  UpdateDisclosureLevelUseCase,
  UpdateReceptivenessUseCase,
} from "@/application/use-cases";
import type { CoreDependencies } from "./container-core";

export function createCoreUseCases(deps: CoreDependencies) {
  return {
    submitAnswerUseCase: new SubmitAnswerUseCase(),
    extractStanceUseCase: new ExtractStanceUseCase({
      piiScrubber: deps.piiScrubber,
      llmExtractor: deps.llmExtractor,
      questions: deps.questions,
    }),
    generateThoughtMapUseCase: new GenerateThoughtMapUseCase({
      baselineProvider: deps.baselineProvider,
      stanceRepository: deps.stanceRepository,
    }),
    findMatchCandidatesUseCase: new FindMatchCandidatesUseCase({
      stanceRepository: deps.stanceRepository,
      matchRepository: deps.matchRepository,
      personaRepository: deps.personaRepository,
    }),
    createAgentDialogueSessionUseCase: new CreateAgentDialogueSessionUseCase({
      personaRepository: deps.personaRepository,
      dialogueRepository: deps.dialogueRepository,
    }),
    createMatchProposalUseCase: new CreateMatchProposalUseCase({
      stanceRepository: deps.stanceRepository,
      matchRepository: deps.matchRepository,
    }),
    respondToProposalUseCase: new RespondToProposalUseCase({
      matchRepository: deps.matchRepository,
      dialogueRepository: deps.dialogueRepository,
    }),
    submitDialogueTurnUseCase: new SubmitDialogueTurnUseCase({
      dialogueRepository: deps.dialogueRepository,
      piiScrubber: deps.piiScrubber,
      facilitator: deps.facilitator,
    }),
    submitAgentDialogueTurnUseCase: new SubmitAgentDialogueTurnUseCase({
      dialogueRepository: deps.dialogueRepository,
      piiScrubber: deps.piiScrubber,
      facilitator: deps.facilitator,
      personaRepository: deps.personaRepository,
      personaDialogueGenerator: deps.personaDialogueGenerator,
    }),
    getDialogueSessionUseCase: new GetDialogueSessionUseCase({
      dialogueRepository: deps.dialogueRepository,
    }),
    checkExpiredSessionsUseCase: new CheckExpiredSessionsUseCase({
      dialogueRepository: deps.dialogueRepository,
    }),
    submitFeedbackUseCase: new SubmitFeedbackUseCase({
      dialogueRepository: deps.dialogueRepository,
      feedbackRepository: deps.feedbackRepository,
    }),
    evaluateUnderstandingUseCase: new EvaluateUnderstandingUseCase({
      dialogueRepository: deps.dialogueRepository,
      feedbackRepository: deps.feedbackRepository,
      piiScrubber: deps.piiScrubber,
      summaryGenerator: deps.summaryGenerator,
    }),
    generateSummaryCardUseCase: new GenerateSummaryCardUseCase({
      dialogueRepository: deps.dialogueRepository,
      feedbackRepository: deps.feedbackRepository,
      piiScrubber: deps.piiScrubber,
      summaryGenerator: deps.summaryGenerator,
    }),
    claimSessionUseCase: new ClaimSessionUseCase({
      userRepository: deps.userRepository,
    }),
    requestFriendshipUseCase: new RequestFriendshipUseCase({
      friendRepository: deps.friendRepository,
      blockRepository: deps.blockRepository,
      dialogueRepository: deps.dialogueRepository,
      eventTracker: deps.eventTracker,
    }),
    respondToFriendRequestUseCase: new RespondToFriendRequestUseCase({
      friendRepository: deps.friendRepository,
      friendshipRepository: deps.friendshipRepository,
      eventTracker: deps.eventTracker,
    }),
    listFriendsUseCase: new ListFriendsUseCase({
      friendshipRepository: deps.friendshipRepository,
    }),
    unfriendUseCase: new UnfriendUseCase({
      friendshipRepository: deps.friendshipRepository,
    }),
    updateDisclosureLevelUseCase: new UpdateDisclosureLevelUseCase({
      disclosureRepository: deps.disclosureRepository,
      friendshipRepository: deps.friendshipRepository,
      eventTracker: deps.eventTracker,
    }),
    getDisclosureLevelsUseCase: new GetDisclosureLevelsUseCase({
      disclosureRepository: deps.disclosureRepository,
      friendshipRepository: deps.friendshipRepository,
    }),
    sendChatMessageUseCase: new SendChatMessageUseCase({
      friendshipRepository: deps.friendshipRepository,
      blockRepository: deps.blockRepository,
      messageRepository: deps.messageRepository,
      realtimeBroadcaster: deps.realtimeBroadcaster,
      rateLimiter: deps.rateLimiter,
      piiScrubber: deps.piiScrubber,
      eventTracker: deps.eventTracker,
    }),
    getChatHistoryUseCase: new GetChatHistoryUseCase({
      friendshipRepository: deps.friendshipRepository,
      messageRepository: deps.messageRepository,
    }),
    markMessagesReadUseCase: new MarkMessagesReadUseCase({
      messageRepository: deps.messageRepository,
      receiptRepository: deps.receiptRepository,
    }),
    submitSafetyReportUseCase: new SubmitSafetyReportUseCase({
      safetyRepository: deps.safetyRepository,
      eventTracker: deps.eventTracker,
    }),
    blockUserUseCase: new BlockUserUseCase({
      blockRepository: deps.blockRepository,
      friendshipRepository: deps.friendshipRepository,
      eventTracker: deps.eventTracker,
    }),
    unblockUserUseCase: new UnblockUserUseCase({
      blockRepository: deps.blockRepository,
      eventTracker: deps.eventTracker,
    }),
    createOfflineProposalUseCase: new CreateOfflineProposalUseCase({
      friendshipRepository: deps.friendshipRepository,
      disclosureRepository: deps.disclosureRepository,
      meetingRepository: deps.meetingRepository,
      eventTracker: deps.eventTracker,
    }),
    respondToOfflineProposalUseCase: new RespondToOfflineProposalUseCase({
      meetingRepository: deps.meetingRepository,
      friendshipRepository: deps.friendshipRepository,
    }),
    submitSafetyCheckinUseCase: new SubmitSafetyCheckinUseCase({
      meetingRepository: deps.meetingRepository,
      friendshipRepository: deps.friendshipRepository,
      eventTracker: deps.eventTracker,
    }),
    submitSelfAffirmationUseCase: new SubmitSelfAffirmationUseCase(
      deps.stanceRepository,
      deps.valueExtractor,
    ),
    submitConfidenceUseCase: new SubmitConfidenceUseCase(deps.stanceRepository),
    calculateMisperceptionUseCase: new CalculateMisperceptionUseCase({
      baselineProvider: deps.baselineProvider,
    }),
    submitReflectionUseCase: new SubmitReflectionUseCase({
      dialogueRepository: deps.dialogueRepository,
    }),
    generateJointSummaryUseCase: new GenerateJointSummaryUseCase({
      dialogueRepository: deps.dialogueRepository,
      summaryGenerator: deps.summaryGenerator,
    }),
    updateReceptivenessUseCase: new UpdateReceptivenessUseCase({
      receptivenessRepository: deps.receptivenessRepository,
    }),
    scheduleFollowUpUseCase: new ScheduleFollowUpUseCase({
      followUpRepository: deps.followUpRepository,
    }),
    submitFollowUpCheckinUseCase: new SubmitFollowUpCheckinUseCase({
      followUpRepository: deps.followUpRepository,
    }),
    startLightProtocolUseCase: new StartLightProtocolUseCase({
      friendshipRepository: deps.friendshipRepository,
      lightProtocolRepository: deps.lightProtocolRepository,
    }),
    submitLightProtocolUseCase: new SubmitLightProtocolUseCase({
      friendshipRepository: deps.friendshipRepository,
      lightProtocolRepository: deps.lightProtocolRepository,
    }),
    checkRealtimeEligibilityUseCase: new CheckRealtimeEligibilityUseCase({
      friendshipRepository: deps.friendshipRepository,
    }),
  };
}
