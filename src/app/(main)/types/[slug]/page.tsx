"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DIMENSION_LABELS,
  DIMENSION_POLES,
  type StanceDimension,
} from "@/domain/value-objects/stance-dimension";

interface MapTypeDetail {
  slug: string;
  name: string;
  alias: string;
  emoji: string;
  description: string;
  traits: string[];
  dimensions: { dimension: StanceDimension; tendency: "high" | "low" }[];
  compatibleTypes: string[];
  tagline: string;
}

const TYPE_DETAILS: MapTypeDetail[] = [
  {
    slug: "balance-seeker",
    name: "BALANCE_SEEKER",
    alias: "균형 탐색가",
    emoji: "\u2696\uFE0F",
    description:
      "다양한 관점을 균형 있게 고려하며, 극단적인 입장보다 중용을 추구합니다.",
    tagline: "모든 면을 보려는 사람",
    traits: [
      "극단적 주장보다 양쪽의 타당한 점을 찾습니다",
      "새로운 정보에 열려 있고 입장 수정을 두려워하지 않습니다",
      "대화에서 다리 역할을 하며 공통점을 발견합니다",
      "복잡한 문제에 단순한 답이 없다는 것을 이해합니다",
    ],
    dimensions: [
      { dimension: "TECH_REGULATION", tendency: "low" },
      { dimension: "REDISTRIBUTION", tendency: "low" },
    ],
    compatibleTypes: ["체제 도전자", "전통 안정가"],
  },
  {
    slug: "liberty-innovator",
    name: "LIBERTY_INNOVATOR",
    alias: "자유 혁신가",
    emoji: "\uD83D\uDE80",
    description:
      "기술 혁신과 개인의 자유를 중시하며, 시장의 자율적 조절을 신뢰합니다.",
    tagline: "미래를 만드는 사람",
    traits: [
      "기술이 사회 문제를 해결할 수 있다고 믿습니다",
      "개인의 자유와 선택권을 최우선으로 여깁니다",
      "규제보다 혁신을 통한 문제 해결을 선호합니다",
      "경쟁과 성과를 통한 발전을 추구합니다",
    ],
    dimensions: [
      { dimension: "TECH_OPTIMISM", tendency: "high" },
      { dimension: "MERITOCRACY", tendency: "high" },
    ],
    compatibleTypes: ["공정 수호자", "균형 탐색가"],
  },
  {
    slug: "fairness-guardian",
    name: "FAIRNESS_GUARDIAN",
    alias: "공정 수호자",
    emoji: "\uD83D\uDEE1\uFE0F",
    description:
      "사회적 공정성과 기회의 평등을 최우선으로 여기며, 적극적인 제도 개선을 지지합니다.",
    tagline: "공정한 세상을 꿈꾸는 사람",
    traits: [
      "모든 사람이 동등한 기회를 가져야 한다고 믿습니다",
      "사회 안전망 강화를 통한 약자 보호를 중시합니다",
      "구조적 불평등의 해소가 우선이라고 생각합니다",
      "연대와 공동체의 가치를 소중히 여깁니다",
    ],
    dimensions: [
      { dimension: "OPPORTUNITY_EQUALITY", tendency: "high" },
      { dimension: "REDISTRIBUTION", tendency: "high" },
    ],
    compatibleTypes: ["자유 혁신가", "실용 중재자"],
  },
  {
    slug: "pragmatic-mediator",
    name: "PRAGMATIC_MEDIATOR",
    alias: "실용 중재자",
    emoji: "\uD83E\uDD1D",
    description:
      "이념보다 실용적 해결을 선호하며, 상황에 따라 유연하게 입장을 조율합니다.",
    tagline: "해결책을 찾는 사람",
    traits: [
      "이념적 순수성보다 실제 효과를 중시합니다",
      "상황에 따라 유연하게 접근 방식을 바꿉니다",
      "서로 다른 입장 사이에서 절충점을 찾습니다",
      "실현 가능한 점진적 개선을 선호합니다",
    ],
    dimensions: [
      { dimension: "WORK_LIFE", tendency: "high" },
      { dimension: "TECH_REGULATION", tendency: "low" },
    ],
    compatibleTypes: ["균형 탐색가", "공정 수호자"],
  },
  {
    slug: "system-challenger",
    name: "SYSTEM_CHALLENGER",
    alias: "체제 도전자",
    emoji: "\u26A1",
    description:
      "현재 시스템의 한계를 인식하고, 근본적인 변화를 통한 개선을 추구합니다.",
    tagline: "변화를 이끄는 사람",
    traits: [
      "현재 시스템의 구조적 문제를 날카롭게 지적합니다",
      "근본적이고 대담한 변화를 두려워하지 않습니다",
      "기존 관습에 의문을 제기하고 새로운 대안을 모색합니다",
      "사회적 약자의 목소리에 귀 기울입니다",
    ],
    dimensions: [
      { dimension: "REDISTRIBUTION", tendency: "high" },
      { dimension: "OPPORTUNITY_EQUALITY", tendency: "high" },
    ],
    compatibleTypes: ["전통 안정가", "자유 혁신가"],
  },
  {
    slug: "tradition-stabilizer",
    name: "TRADITION_STABILIZER",
    alias: "전통 안정가",
    emoji: "\uD83C\uDFDB\uFE0F",
    description:
      "검증된 가치와 안정을 중시하며, 점진적이고 신중한 변화를 선호합니다.",
    tagline: "안정을 지키는 사람",
    traits: [
      "검증된 가치와 제도를 보존하려 합니다",
      "급격한 변화보다 점진적 개선을 선호합니다",
      "전통과 경험에서 오는 지혜를 존중합니다",
      "안정적인 사회 질서가 발전의 토대라고 믿습니다",
    ],
    dimensions: [
      { dimension: "MERITOCRACY", tendency: "high" },
      { dimension: "TECH_REGULATION", tendency: "low" },
    ],
    compatibleTypes: ["체제 도전자", "균형 탐색가"],
  },
];

function getTypeBySlug(slug: string): MapTypeDetail | undefined {
  return TYPE_DETAILS.find((t) => t.slug === slug);
}

export default function TypeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const typeInfo = getTypeBySlug(slug);

  if (!typeInfo) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      {/* Hero */}
      <motion.div
        className="text-center space-y-3 mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-6xl block">{typeInfo.emoji}</span>
        <h1 className="text-3xl font-bold font-heading text-text-primary">
          {typeInfo.alias}
        </h1>
        <p className="text-base text-text-secondary italic">
          {typeInfo.tagline}
        </p>
        <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
          {typeInfo.description}
        </p>
      </motion.div>

      {/* Traits */}
      <motion.section
        className="mb-6 rounded-2xl border border-border-soft bg-surface-card p-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
          주요 특성
        </h2>
        <ul className="space-y-2.5">
          {typeInfo.traits.map((trait, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-text-primary leading-relaxed">
              <span className="mt-0.5 text-accent-primary flex-shrink-0">
                {"\u2022"}
              </span>
              {trait}
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Key Dimensions */}
      <motion.section
        className="mb-6 rounded-2xl border border-border-soft bg-surface-card p-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
          핵심 성향
        </h2>
        <div className="space-y-3">
          {typeInfo.dimensions.map(({ dimension, tendency }) => (
            <div key={dimension} className="flex items-center justify-between">
              <span className="text-sm text-text-primary font-medium">
                {DIMENSION_LABELS[dimension]}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-pill bg-accent-primary-soft text-accent-primary font-medium">
                {DIMENSION_POLES[dimension][tendency]} 성향
              </span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Compatible Types */}
      <motion.section
        className="mb-8 rounded-2xl border border-border-soft bg-surface-card p-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
          대화가 잘 맞는 유형
        </h2>
        <div className="flex flex-wrap gap-2">
          {typeInfo.compatibleTypes.map((name) => {
            const matched = TYPE_DETAILS.find((t) => t.alias === name);
            return (
              <Link
                key={name}
                href={matched ? `/types/${matched.slug}` : "#"}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill border border-border-soft text-sm text-text-primary hover:bg-surface-raised transition-colors"
              >
                {matched?.emoji} {name}
              </Link>
            );
          })}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Link
          href="/onboarding"
          className="block w-full text-center rounded-pill gradient-cta text-text-inverse font-semibold py-3 shadow-cta hover:opacity-90 transition-opacity"
        >
          나의 유형 알아보기
        </Link>
        <Link
          href="/matching"
          className="block w-full text-center rounded-pill border border-border-soft text-text-secondary font-medium py-3 hover:bg-surface-raised transition-colors"
        >
          대화 상대 찾기
        </Link>
      </motion.div>

      {/* Branding */}
      <p className="text-center text-xs text-text-tertiary mt-8">
        PerspectiveShift
      </p>
    </main>
  );
}
