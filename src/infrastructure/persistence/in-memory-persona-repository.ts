import type { PersonaRepository } from "@/domain/interfaces/persona-repository";
import { PersonaProfile } from "@/domain/entities/persona-profile";
import { StanceVector } from "@/domain/entities/stance-vector";

const SEED_PERSONAS: PersonaProfile[] = [
  PersonaProfile.create({
    id: "persona-realist",
    name: "현실주의 직장인",
    ageGroup: "30대",
    jobCategory: "IT직군",
    stanceLabel: "경제 보수",
    description: "실용적 관점에서 경제 정책을 바라보며, 시장 효율성과 개인의 노력을 중시합니다.",
    conversationStyle: "logical",
    stanceVector: StanceVector.fromValues({
      TECH_REGULATION: -0.3,
      REDISTRIBUTION: -0.5,
      WORK_LIFE: -0.2,
      MERITOCRACY: 0.7,
      TECH_OPTIMISM: 0.6,
      OPPORTUNITY_EQUALITY: -0.3,
    }),
    experienceBank: [
      "IT 업계에서 10년째 일하고 있습니다.",
      "세금이 오르면 투자가 줄어든다고 생각합니다.",
      "스타트업에서 일하며 자기 결정권의 중요성을 체감했습니다.",
    ],
  }),
  PersonaProfile.create({
    id: "persona-educator",
    name: "공감하는 교육자",
    ageGroup: "40대",
    jobCategory: "교육직",
    stanceLabel: "사회 진보",
    description: "교육 현장의 경험을 바탕으로 사회 정책을 이야기하며, 공감과 배려를 중시합니다.",
    conversationStyle: "emotional",
    stanceVector: StanceVector.fromValues({
      TECH_REGULATION: 0.4,
      REDISTRIBUTION: 0.6,
      WORK_LIFE: 0.7,
      MERITOCRACY: -0.4,
      TECH_OPTIMISM: -0.1,
      OPPORTUNITY_EQUALITY: 0.8,
    }),
    experienceBank: [
      "20년간 중학교에서 학생들을 가르치고 있습니다.",
      "교육 격차가 사회 불평등의 근본 원인이라고 봅니다.",
      "모든 아이가 같은 출발선에 설 수 있어야 한다고 믿습니다.",
    ],
  }),
  PersonaProfile.create({
    id: "persona-student",
    name: "탐구하는 대학생",
    ageGroup: "20대",
    jobCategory: "학생",
    stanceLabel: "중도",
    description: "다양한 관점을 탐구하며 균형 잡힌 시각을 추구합니다. 질문을 통해 생각을 넓혀갑니다.",
    conversationStyle: "careful",
    stanceVector: StanceVector.fromValues({
      TECH_REGULATION: 0.1,
      REDISTRIBUTION: 0.1,
      WORK_LIFE: 0.3,
      MERITOCRACY: 0.0,
      TECH_OPTIMISM: 0.2,
      OPPORTUNITY_EQUALITY: 0.2,
    }),
    experienceBank: [
      "정치외교학을 전공하고 있습니다.",
      "양쪽 입장의 장단점을 모두 이해하려고 노력합니다.",
      "아르바이트를 하면서 노동 환경의 현실을 직접 경험했습니다.",
    ],
  }),
];

export class InMemoryPersonaRepository implements PersonaRepository {
  async findAll(): Promise<PersonaProfile[]> {
    return [...SEED_PERSONAS];
  }

  async findById(id: string): Promise<PersonaProfile | null> {
    return SEED_PERSONAS.find((p) => p.id === id) ?? null;
  }
}
