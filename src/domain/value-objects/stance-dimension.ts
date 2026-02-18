export const StanceDimension = {
  TECH_REGULATION: "TECH_REGULATION",
  REDISTRIBUTION: "REDISTRIBUTION",
  WORK_LIFE: "WORK_LIFE",
  MERITOCRACY: "MERITOCRACY",
  TECH_OPTIMISM: "TECH_OPTIMISM",
  OPPORTUNITY_EQUALITY: "OPPORTUNITY_EQUALITY",
} as const;

export type StanceDimension =
  (typeof StanceDimension)[keyof typeof StanceDimension];

export const ALL_DIMENSIONS: readonly StanceDimension[] =
  Object.values(StanceDimension);

export const DIMENSION_LABELS: Record<StanceDimension, string> = {
  TECH_REGULATION: "기술 규제",
  REDISTRIBUTION: "소득 재분배",
  WORK_LIFE: "일·생활 균형",
  MERITOCRACY: "능력주의",
  TECH_OPTIMISM: "기술 낙관",
  OPPORTUNITY_EQUALITY: "기회 균등",
};

export const DIMENSION_POLES: Record<
  StanceDimension,
  { low: string; high: string }
> = {
  TECH_REGULATION: { low: "자율", high: "규제" },
  REDISTRIBUTION: { low: "시장", high: "복지" },
  WORK_LIFE: { low: "성과", high: "균형" },
  MERITOCRACY: { low: "구조적 요인", high: "개인 노력" },
  TECH_OPTIMISM: { low: "위험 경계", high: "기회 낙관" },
  OPPORTUNITY_EQUALITY: { low: "현 체제", high: "적극 보정" },
};
