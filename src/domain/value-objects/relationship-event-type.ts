export const RELATIONSHIP_EVENT_TYPES = {
  FRIEND_REQUEST_SENT: "friend_request_sent",
  FRIENDSHIP_CREATED: "friendship_created",
  FRIENDSHIP_ENDED: "friendship_ended",
  DISCLOSURE_ESCALATED: "disclosure_escalated",
  REALTIME_MESSAGE_SENT: "realtime_message_sent",
  OFFLINE_PROPOSAL_CREATED: "offline_proposal_created",
  OFFLINE_PROPOSAL_CONFIRMED: "offline_proposal_confirmed",
  USER_BLOCKED: "user_blocked",
  USER_UNBLOCKED: "user_unblocked",
  SAFETY_REPORT_SUBMITTED: "safety_report_submitted",
  SAFETY_CHECKIN_SUBMITTED: "safety_checkin_submitted",
} as const;

export type RelationshipEventType =
  (typeof RELATIONSHIP_EVENT_TYPES)[keyof typeof RELATIONSHIP_EVENT_TYPES];
