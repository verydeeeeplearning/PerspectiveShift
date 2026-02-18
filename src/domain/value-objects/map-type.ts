import type { StanceDimension } from "./stance-dimension";
import type { StanceAxis } from "./stance-axis";

export const MapTypeName = {
  BALANCE_SEEKER: "BALANCE_SEEKER",
  LIBERTY_INNOVATOR: "LIBERTY_INNOVATOR",
  FAIRNESS_GUARDIAN: "FAIRNESS_GUARDIAN",
  PRAGMATIC_MEDIATOR: "PRAGMATIC_MEDIATOR",
  SYSTEM_CHALLENGER: "SYSTEM_CHALLENGER",
  TRADITION_STABILIZER: "TRADITION_STABILIZER",
} as const;

export type MapTypeName =
  (typeof MapTypeName)[keyof typeof MapTypeName];

export interface MapTypeInfo {
  name: MapTypeName;
  alias: string;
  emoji: string;
  description: string;
}

const MAP_TYPE_REGISTRY: Record<MapTypeName, Omit<MapTypeInfo, "name">> =
  {
    BALANCE_SEEKER: {
      alias: "균형 탐색가",
      emoji: "\u2696\uFE0F",
      description:
        "다양한 관점을 균형 있게 고려하며, 극단적인 입장보다 중용을 추구합니다.",
    },
    LIBERTY_INNOVATOR: {
      alias: "자유 혁신가",
      emoji: "\uD83D\uDE80",
      description:
        "기술 혁신과 개인의 자유를 중시하며, 시장의 자율적 조절을 신뢰합니다.",
    },
    FAIRNESS_GUARDIAN: {
      alias: "공정 수호자",
      emoji: "\uD83D\uDEE1\uFE0F",
      description:
        "사회적 공정성과 기회의 평등을 최우선으로 여기며, 적극적인 제도 개선을 지지합니다.",
    },
    PRAGMATIC_MEDIATOR: {
      alias: "실용 중재자",
      emoji: "\uD83E\uDD1D",
      description:
        "이념보다 실용적 해결을 선호하며, 상황에 따라 유연하게 입장을 조율합니다.",
    },
    SYSTEM_CHALLENGER: {
      alias: "체제 도전자",
      emoji: "\u26A1",
      description:
        "현재 시스템의 한계를 인식하고, 근본적인 변화를 통한 개선을 추구합니다.",
    },
    TRADITION_STABILIZER: {
      alias: "전통 안정가",
      emoji: "\uD83C\uDFDB\uFE0F",
      description:
        "검증된 가치와 안정을 중시하며, 점진적이고 신중한 변화를 선호합니다.",
    },
  };

export function getMapTypeInfo(name: MapTypeName): MapTypeInfo {
  return { name, ...MAP_TYPE_REGISTRY[name] };
}

export function classifyMapType(
  axes: Record<StanceDimension, StanceAxis>,
): MapTypeName {
  const v = Object.fromEntries(
    Object.entries(axes).map(([k, a]) => [k, a.value]),
  ) as Record<StanceDimension, number>;

  const allNearZero = Object.values(v).every(
    (val) => Math.abs(val) <= 0.3,
  );
  if (allNearZero) return MapTypeName.BALANCE_SEEKER;

  const progressiveScore =
    v.REDISTRIBUTION + v.OPPORTUNITY_EQUALITY - v.MERITOCRACY;
  const libertarianScore =
    v.TECH_OPTIMISM - v.TECH_REGULATION - v.REDISTRIBUTION;
  const conservativeScore =
    v.MERITOCRACY - v.REDISTRIBUTION - v.OPPORTUNITY_EQUALITY;

  const hasStrongOpinions = Object.values(v).some(
    (val) => Math.abs(val) >= 0.7,
  );
  const hasMixedPositions =
    Object.values(v).filter((val) => val > 0.2).length >= 2 &&
    Object.values(v).filter((val) => val < -0.2).length >= 2;

  if (hasMixedPositions && !hasStrongOpinions) {
    return MapTypeName.PRAGMATIC_MEDIATOR;
  }

  const scores: [MapTypeName, number][] = [
    [MapTypeName.LIBERTY_INNOVATOR, libertarianScore],
    [MapTypeName.FAIRNESS_GUARDIAN, progressiveScore],
    [MapTypeName.SYSTEM_CHALLENGER, progressiveScore + v.TECH_OPTIMISM],
    [MapTypeName.TRADITION_STABILIZER, conservativeScore],
  ];

  scores.sort((a, b) => b[1] - a[1]);
  return scores[0][0];
}
