export const PHASE1_EVENTS = [
  "TrustMomentViewed", "TrustMomentMoreClicked",
  "WarmupViewed", "WarmupSkipped", "WarmupCompleted",
  "OnboardingModeSelected", "OnboardingQuestionViewed", "OnboardingQuestionAnswered",
  "PrecisionMeterViewed", "PrecisionUpgradeClicked",
  "ThoughtMapViewed", "ThoughtMapShareClicked", "ShareTypeSelected", "ShareCompleted",
  "MisperceptionViewed", "MisperceptionPredictSubmitted", "MisperceptionResultViewed",
  "NextStepHubViewed", "CTAMatchClicked", "CTAPrecisionClicked", "CTADeepDiveClicked",
] as const;

export const PHASE2_EVENTS = [
  "MatchCardImpression", "MatchAccepted", "MatchDeclined", "DeclineReasonSubmitted",
  "EnergyCheckSelected",
  "DialogueStepViewed", "DialogueStepCompleted",
  "CoachButtonTapped", "ScaffoldUsed",
  "HighlightCreated", "HighlightAutoCited",
  "ToneCheckShown", "ToneCheckAccepted", "SentAnyway",
  "ReceptiveTemplateInserted",
  "R1QuizAnswered", "R1TextSubmitted", "R2SliderMoved", "R2CorrectionAdded",
  "R3RoleplayStarted", "R3Submitted", "R3Skipped",
  "JointSummaryViewed", "JointSummaryShared",
  "GiftMessageWritten", "GiftMessageReceived",
  "BlindSpotViewed", "BlindSpotSaved",
  "PeakEndKPISubmitted", "NextQuestionSaved", "NextQuestionSkipped",
  "BadExperienceTriggered", "BadExperienceCTAClicked",
  "D1ReplayViewed", "D1ReplayResponsed", "D7PassportViewed", "D7PassportNewConversation",
] as const;

export const PHASE3_EVENTS = [
  "FriendRequestPromptViewed", "FriendRequestSent", "FriendRequestMatched",
  "LightProtocolStarted", "LightProtocolCompleted",
  "RealtimeChatStarted",
  "OfflineMeetEligible", "OfflineMeetRSVP",
  "StanceDriftOptedIn", "StanceDriftNotificationViewed",
] as const;

export const ALL_EVENTS = [...PHASE1_EVENTS, ...PHASE2_EVENTS, ...PHASE3_EVENTS] as const;

export type AnalyticsEventType = (typeof ALL_EVENTS)[number];

export interface EventMetadata {
  userId: string;
  timestamp: number;
  sessionId: string;
  deviceType: string;
  appVersion: string;
}

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  payload: Record<string, unknown>;
  metadata: EventMetadata;
}

export function createAnalyticsEvent(
  type: AnalyticsEventType,
  payload: Record<string, unknown>,
  metadata: EventMetadata,
): AnalyticsEvent {
  return { type, payload, metadata };
}
