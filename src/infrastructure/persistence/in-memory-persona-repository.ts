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
  PersonaProfile.create({
    id: "persona-entrepreneur",
    name: "도전하는 창업가",
    ageGroup: "30대",
    jobCategory: "스타트업 대표",
    stanceLabel: "기술 낙관",
    description: "기술이 세상을 바꿀 수 있다고 믿으며, 규제보다 혁신의 자유를 중시합니다.",
    conversationStyle: "logical",
    stanceVector: StanceVector.fromValues({
      TECH_REGULATION: -0.7,
      REDISTRIBUTION: -0.3,
      WORK_LIFE: -0.5,
      MERITOCRACY: 0.8,
      TECH_OPTIMISM: 0.9,
      OPPORTUNITY_EQUALITY: -0.1,
    }),
    experienceBank: [
      "AI 스타트업을 창업해서 3년째 운영하고 있습니다.",
      "좋은 규제는 필요하지만, 과도한 규제는 혁신을 죽인다고 생각합니다.",
      "실리콘밸리에서 1년간 일하며 글로벌 경쟁력의 중요성을 느꼈습니다.",
    ],
  }),
  PersonaProfile.create({
    id: "persona-nurse",
    name: "헌신적인 간호사",
    ageGroup: "30대",
    jobCategory: "의료직",
    stanceLabel: "복지 확대",
    description: "의료 현장에서 사회 안전망의 중요성을 매일 체감하며, 보편적 복지를 지지합니다.",
    conversationStyle: "emotional",
    stanceVector: StanceVector.fromValues({
      TECH_REGULATION: 0.2,
      REDISTRIBUTION: 0.7,
      WORK_LIFE: 0.8,
      MERITOCRACY: -0.3,
      TECH_OPTIMISM: 0.1,
      OPPORTUNITY_EQUALITY: 0.6,
    }),
    experienceBank: [
      "대학병원 응급실에서 8년째 근무하고 있습니다.",
      "의료비 때문에 치료를 포기하는 환자들을 자주 봅니다.",
      "3교대 근무를 하면서 워라밸의 중요성을 절감합니다.",
    ],
  }),
  PersonaProfile.create({
    id: "persona-selfemployed",
    name: "자수성가 사업가",
    ageGroup: "50대",
    jobCategory: "자영업",
    stanceLabel: "자유 시장",
    description: "30년 넘게 장사하며 체득한 경험으로, 정부 개입보다 개인 노력을 신뢰합니다.",
    conversationStyle: "humorous",
    stanceVector: StanceVector.fromValues({
      TECH_REGULATION: -0.4,
      REDISTRIBUTION: -0.6,
      WORK_LIFE: -0.4,
      MERITOCRACY: 0.9,
      TECH_OPTIMISM: -0.2,
      OPPORTUNITY_EQUALITY: -0.5,
    }),
    experienceBank: [
      "식당을 운영한 지 25년이 넘었습니다.",
      "최저임금 인상 때마다 직원 수를 줄여야 했습니다.",
      "자식 셋을 내 힘으로 대학까지 보냈습니다.",
    ],
  }),
  PersonaProfile.create({
    id: "persona-activist",
    name: "열정적인 활동가",
    ageGroup: "20대",
    jobCategory: "시민단체",
    stanceLabel: "사회 변혁",
    description: "기후위기와 불평등에 맞서 목소리를 내며, 근본적인 체제 변화를 추구합니다.",
    conversationStyle: "emotional",
    stanceVector: StanceVector.fromValues({
      TECH_REGULATION: 0.7,
      REDISTRIBUTION: 0.8,
      WORK_LIFE: 0.6,
      MERITOCRACY: -0.7,
      TECH_OPTIMISM: -0.3,
      OPPORTUNITY_EQUALITY: 0.9,
    }),
    experienceBank: [
      "환경단체에서 기후 정의 캠페인을 기획하고 있습니다.",
      "대학 등록금 투쟁에 참여하면서 사회운동을 시작했습니다.",
      "불평등은 개인의 문제가 아니라 구조의 문제라고 생각합니다.",
    ],
  }),
  PersonaProfile.create({
    id: "persona-researcher",
    name: "냉철한 연구원",
    ageGroup: "40대",
    jobCategory: "연구직",
    stanceLabel: "데이터 중심",
    description: "감정보다 데이터와 근거를 중시하며, 정책의 실제 효과를 분석적으로 판단합니다.",
    conversationStyle: "careful",
    stanceVector: StanceVector.fromValues({
      TECH_REGULATION: 0.1,
      REDISTRIBUTION: 0.2,
      WORK_LIFE: 0.1,
      MERITOCRACY: 0.3,
      TECH_OPTIMISM: 0.5,
      OPPORTUNITY_EQUALITY: 0.1,
    }),
    experienceBank: [
      "경제학 박사 과정을 마치고 국책연구원에서 일하고 있습니다.",
      "정책 효과를 측정할 때는 의도가 아니라 결과를 봐야 합니다.",
      "좌우 구분보다 증거 기반 정책이 중요하다고 봅니다.",
    ],
  }),
  PersonaProfile.create({
    id: "persona-freelancer",
    name: "자유로운 프리랜서",
    ageGroup: "30대",
    jobCategory: "디자인",
    stanceLabel: "개인 자유",
    description: "자유로운 삶의 방식을 추구하며, 개인의 선택권과 다양성을 존중합니다.",
    conversationStyle: "humorous",
    stanceVector: StanceVector.fromValues({
      TECH_REGULATION: -0.5,
      REDISTRIBUTION: 0.0,
      WORK_LIFE: 0.5,
      MERITOCRACY: 0.2,
      TECH_OPTIMISM: 0.4,
      OPPORTUNITY_EQUALITY: 0.3,
    }),
    experienceBank: [
      "회사를 그만두고 프리랜서 디자이너로 3년째 일하고 있습니다.",
      "정규직 중심 사회에서 프리랜서는 항상 불안합니다.",
      "다양한 일을 경험하면서 시야가 넓어졌습니다.",
    ],
  }),
  PersonaProfile.create({
    id: "persona-retiree",
    name: "경험 많은 은퇴자",
    ageGroup: "60대",
    jobCategory: "은퇴",
    stanceLabel: "전통 가치",
    description: "오랜 사회 경험을 바탕으로 안정과 전통적 가치를 중시하며, 급격한 변화에 신중합니다.",
    conversationStyle: "careful",
    stanceVector: StanceVector.fromValues({
      TECH_REGULATION: 0.3,
      REDISTRIBUTION: 0.1,
      WORK_LIFE: 0.2,
      MERITOCRACY: 0.5,
      TECH_OPTIMISM: -0.4,
      OPPORTUNITY_EQUALITY: -0.1,
    }),
    experienceBank: [
      "공기업에서 35년간 근무하고 작년에 은퇴했습니다.",
      "급격한 변화보다 점진적인 개선이 오래 갑니다.",
      "젊은 세대의 열정은 이해하지만, 현실은 복잡합니다.",
    ],
  }),
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const DISPLAY_COUNT = 4;

export class InMemoryPersonaRepository implements PersonaRepository {
  async findAll(): Promise<PersonaProfile[]> {
    return shuffle(SEED_PERSONAS).slice(0, DISPLAY_COUNT);
  }

  async findById(id: string): Promise<PersonaProfile | null> {
    return SEED_PERSONAS.find((p) => p.id === id) ?? null;
  }
}
