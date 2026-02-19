import type { LightProtocolType } from "@/domain/value-objects/light-protocol-type";
import type { LightProtocolStatus, ProtocolResponseData } from "@/domain/entities/light-protocol-session";

export interface LightProtocolOutput {
  id: string;
  friendshipId: string;
  type: LightProtocolType;
  initiatorId: string;
  status: LightProtocolStatus;
  initiatorResponse: ProtocolResponseData | null;
  responderResponse: ProtocolResponseData | null;
  createdAt: string;
  completedAt: string | null;
}

export interface RealtimeEligibilityOutput {
  eligible: boolean;
  reason?: string;
}
