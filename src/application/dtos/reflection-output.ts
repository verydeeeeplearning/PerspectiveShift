import type { ReflectionType } from "@/domain/value-objects/reflection-item";

export interface ReflectionItemOutput {
  type: ReflectionType;
  content: string;
  isRequired: boolean;
}

export interface ReflectionOutput {
  sessionId: string;
  participantId: string;
  items: ReflectionItemOutput[];
  submittedAt: string;
}
