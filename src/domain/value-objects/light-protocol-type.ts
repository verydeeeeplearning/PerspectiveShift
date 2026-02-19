export const LIGHT_PROTOCOL_TYPES = [
  "COMMON_GROUND",
  "JOINT_QUESTION",
  "SWITCH_SIDES",
] as const;

export type LightProtocolType = (typeof LIGHT_PROTOCOL_TYPES)[number];

export interface LightProtocolMeta {
  name: string;
  description: string;
  durationMinutes: number;
  requiredFields: string[];
}

export const LIGHT_PROTOCOL_META: Record<LightProtocolType, LightProtocolMeta> =
  {
    COMMON_GROUND: {
      name: "Common Ground Check",
      description:
        "우리가 동의하는 것, 다른 것, 궁금한 것을 확인합니다",
      durationMinutes: 3,
      requiredFields: ["agreedPoint", "differentPoint", "curiousPoint"],
    },
    JOINT_QUESTION: {
      name: "Joint Question",
      description: "우리 둘 다 답을 모르는 질문을 함께 만듭니다",
      durationMinutes: 5,
      requiredFields: ["proposedQuestion"],
    },
    SWITCH_SIDES: {
      name: "Switch Sides Mini",
      description: "상대의 입장에서 나의 주장을 말해봅니다",
      durationMinutes: 5,
      requiredFields: ["switchedPerspective"],
    },
  };

export function isValidLightProtocolType(
  value: string,
): value is LightProtocolType {
  return LIGHT_PROTOCOL_TYPES.includes(value as LightProtocolType);
}
