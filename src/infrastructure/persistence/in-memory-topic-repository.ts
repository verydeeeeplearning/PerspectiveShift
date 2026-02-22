import type { TopicRepository } from "@/domain/interfaces/topic-repository";
import { ControversialTopic } from "@/domain/value-objects/controversial-topic";
import type { StanceDimension } from "@/domain/value-objects/stance-dimension";

const SEED_TOPICS: ControversialTopic[] = [
  // ── TECH_REGULATION (8) ──
  ControversialTopic.create({
    id: "tr-01",
    title: "AI 챗봇에도 연령 제한을 둬야 하는가?",
    description: "청소년의 AI 사용을 규제할 필요성과 기술 접근권 사이의 균형을 논합니다.",
    dimensions: ["TECH_REGULATION", "OPPORTUNITY_EQUALITY"],
    tags: ["AI", "청소년", "규제"],
  }),
  ControversialTopic.create({
    id: "tr-02",
    title: "딥페이크 영상 제작 자체를 처벌해야 하는가?",
    description: "딥페이크 기술의 표현 자유와 피해 예방 사이의 갈등을 다룹니다.",
    dimensions: ["TECH_REGULATION"],
    tags: ["딥페이크", "표현의자유", "처벌"],
  }),
  ControversialTopic.create({
    id: "tr-03",
    title: "SNS 기업이 가짜뉴스를 자체 판단해 삭제해도 되는가?",
    description: "플랫폼의 콘텐츠 규제 권한과 검열 우려를 논합니다.",
    dimensions: ["TECH_REGULATION"],
    tags: ["SNS", "가짜뉴스", "검열"],
  }),
  ControversialTopic.create({
    id: "tr-04",
    title: "안면인식 기술을 공공장소에서 사용해도 되는가?",
    description: "치안 목적의 안면인식 기술 도입과 프라이버시 침해 우려를 논합니다.",
    dimensions: ["TECH_REGULATION"],
    tags: ["안면인식", "프라이버시", "치안"],
  }),
  ControversialTopic.create({
    id: "tr-05",
    title: "알고리즘 추천 시스템을 정부가 규제해야 하는가?",
    description: "유튜브·틱톡 등 알고리즘이 여론을 조작할 가능성과 규제 방안을 논합니다.",
    dimensions: ["TECH_REGULATION"],
    tags: ["알고리즘", "여론", "플랫폼"],
  }),
  ControversialTopic.create({
    id: "tr-06",
    title: "개인 데이터를 기업이 아닌 국가가 관리해야 하는가?",
    description: "데이터 주권과 국가 관리의 효율성·위험성을 논합니다.",
    dimensions: ["TECH_REGULATION", "REDISTRIBUTION"],
    tags: ["데이터", "주권", "프라이버시"],
  }),
  ControversialTopic.create({
    id: "tr-07",
    title: "자율주행차 사고 시 제조사가 전적으로 책임져야 하는가?",
    description: "자율주행 기술의 법적 책임 소재와 기술 발전의 균형을 논합니다.",
    dimensions: ["TECH_REGULATION", "TECH_OPTIMISM"],
    tags: ["자율주행", "책임", "법률"],
  }),
  ControversialTopic.create({
    id: "tr-08",
    title: "초등학생의 스마트폰 사용을 법으로 제한해야 하는가?",
    description: "디지털 리터러시 교육과 아동 보호 사이의 균형을 논합니다.",
    dimensions: ["TECH_REGULATION", "OPPORTUNITY_EQUALITY"],
    tags: ["스마트폰", "아동", "교육"],
  }),

  // ── REDISTRIBUTION (9) ──
  ControversialTopic.create({
    id: "rd-01",
    title: "모든 국민에게 월 50만 원 기본소득을 지급해야 하는가?",
    description: "보편적 기본소득의 실현 가능성과 재정 부담을 논합니다.",
    dimensions: ["REDISTRIBUTION"],
    tags: ["기본소득", "복지", "재정"],
  }),
  ControversialTopic.create({
    id: "rd-02",
    title: "상속세를 대폭 올려야 하는가?",
    description: "부의 대물림 방지와 재산권 보호 사이의 갈등을 다룹니다.",
    dimensions: ["REDISTRIBUTION", "MERITOCRACY"],
    tags: ["상속세", "부의대물림", "세금"],
  }),
  ControversialTopic.create({
    id: "rd-03",
    title: "대학 등록금을 전면 무상화해야 하는가?",
    description: "교육 기회 균등과 재정 부담 사이의 트레이드오프를 논합니다.",
    dimensions: ["REDISTRIBUTION", "OPPORTUNITY_EQUALITY"],
    tags: ["등록금", "무상교육", "대학"],
  }),
  ControversialTopic.create({
    id: "rd-04",
    title: "건강보험료를 소득에 비례해 더 크게 차등화해야 하는가?",
    description: "소득 기반 보험료 부과의 형평성과 부담 한계를 논합니다.",
    dimensions: ["REDISTRIBUTION"],
    tags: ["건강보험", "소득", "형평성"],
  }),
  ControversialTopic.create({
    id: "rd-05",
    title: "최저임금을 1만 5천 원 이상으로 올려야 하는가?",
    description: "노동자 생활 보장과 소상공인 부담 사이의 균형을 논합니다.",
    dimensions: ["REDISTRIBUTION", "WORK_LIFE"],
    tags: ["최저임금", "노동", "소상공인"],
  }),
  ControversialTopic.create({
    id: "rd-06",
    title: "순자산 100억 이상에 부유세를 부과해야 하는가?",
    description: "극단적 부의 집중 해소와 자본 유출 우려를 논합니다.",
    dimensions: ["REDISTRIBUTION"],
    tags: ["부유세", "자산", "불평등"],
  }),
  ControversialTopic.create({
    id: "rd-07",
    title: "공공임대 주택을 전체 주택의 30%까지 늘려야 하는가?",
    description: "주거 안정 정책과 부동산 시장 영향을 논합니다.",
    dimensions: ["REDISTRIBUTION", "OPPORTUNITY_EQUALITY"],
    tags: ["공공임대", "주거", "부동산"],
  }),
  ControversialTopic.create({
    id: "rd-08",
    title: "국민연금 보험료율을 지금보다 두 배로 올려야 하는가?",
    description: "연금 기금 고갈 위기와 현세대 부담 사이의 세대 갈등을 다룹니다.",
    dimensions: ["REDISTRIBUTION"],
    tags: ["국민연금", "세대갈등", "재정"],
  }),
  ControversialTopic.create({
    id: "rd-09",
    title: "무상급식을 고등학교까지 확대해야 하는가?",
    description: "보편 복지와 선별 복지 논쟁을 급식 사례로 살펴봅니다.",
    dimensions: ["REDISTRIBUTION", "OPPORTUNITY_EQUALITY"],
    tags: ["무상급식", "보편복지", "교육"],
  }),

  // ── WORK_LIFE (8) ──
  ControversialTopic.create({
    id: "wl-01",
    title: "주 4일 근무제를 법으로 의무화해야 하는가?",
    description: "노동 시간 단축의 생산성 효과와 산업별 현실을 논합니다.",
    dimensions: ["WORK_LIFE"],
    tags: ["주4일제", "노동시간", "생산성"],
  }),
  ControversialTopic.create({
    id: "wl-02",
    title: "퇴근 후 업무 연락을 법으로 금지해야 하는가?",
    description: "연결되지 않을 권리와 업무 효율 사이의 갈등을 다룹니다.",
    dimensions: ["WORK_LIFE"],
    tags: ["야근", "퇴근", "워라밸"],
  }),
  ControversialTopic.create({
    id: "wl-03",
    title: "재택근무를 노동자의 권리로 보장해야 하는가?",
    description: "원격 근무의 유연성과 직종별 형평성 문제를 논합니다.",
    dimensions: ["WORK_LIFE", "OPPORTUNITY_EQUALITY"],
    tags: ["재택근무", "유연근무", "권리"],
  }),
  ControversialTopic.create({
    id: "wl-04",
    title: "육아휴직 1년을 남녀 모두 의무화해야 하는가?",
    description: "양성평등한 육아 분담과 기업 부담을 논합니다.",
    dimensions: ["WORK_LIFE", "OPPORTUNITY_EQUALITY"],
    tags: ["육아휴직", "양성평등", "저출생"],
  }),
  ControversialTopic.create({
    id: "wl-05",
    title: "프리랜서도 정규직과 동일한 사회보험 혜택을 받아야 하는가?",
    description: "플랫폼 노동자의 사회 안전망과 고용 형태의 변화를 논합니다.",
    dimensions: ["WORK_LIFE", "REDISTRIBUTION"],
    tags: ["프리랜서", "사회보험", "플랫폼노동"],
  }),
  ControversialTopic.create({
    id: "wl-06",
    title: "10년 근속자에게 1년 유급 안식년을 보장해야 하는가?",
    description: "장기 근속 보상과 기업 인력 운용의 균형을 논합니다.",
    dimensions: ["WORK_LIFE"],
    tags: ["안식년", "근속", "복지"],
  }),
  ControversialTopic.create({
    id: "wl-07",
    title: "회사가 직원의 위치를 실시간 추적해도 되는가?",
    description: "근무 관리의 효율성과 노동자 프라이버시를 논합니다.",
    dimensions: ["WORK_LIFE", "TECH_REGULATION"],
    tags: ["감시", "프라이버시", "근태"],
  }),
  ControversialTopic.create({
    id: "wl-08",
    title: "연차 최소 25일을 법으로 의무화해야 하는가?",
    description: "충분한 휴식권 보장과 중소기업 현실 사이의 갈등을 다룹니다.",
    dimensions: ["WORK_LIFE"],
    tags: ["연차", "휴가", "근로기준"],
  }),

  // ── MERITOCRACY (8) ──
  ControversialTopic.create({
    id: "mc-01",
    title: "입사 지원서에서 학교 이름을 완전히 가려야 하는가?",
    description: "블라인드 채용의 공정성과 실효성을 논합니다.",
    dimensions: ["MERITOCRACY"],
    tags: ["블라인드채용", "학벌", "공정"],
  }),
  ControversialTopic.create({
    id: "mc-02",
    title: "'수저론'은 노력을 포기하게 만드는 해로운 담론인가?",
    description: "구조적 불평등 인식과 개인 동기부여 사이의 갈등을 논합니다.",
    dimensions: ["MERITOCRACY", "OPPORTUNITY_EQUALITY"],
    tags: ["수저론", "불평등", "노력"],
  }),
  ControversialTopic.create({
    id: "mc-03",
    title: "대입 수시전형을 폐지하고 수능 100%로 가야 하는가?",
    description: "입시 공정성과 다양한 역량 평가 사이의 트레이드오프를 다룹니다.",
    dimensions: ["MERITOCRACY", "OPPORTUNITY_EQUALITY"],
    tags: ["수능", "수시", "입시"],
  }),
  ControversialTopic.create({
    id: "mc-04",
    title: "성과급 차등 폭을 최대 300%까지 허용해야 하는가?",
    description: "성과 기반 보상의 동기 부여 효과와 조직 갈등을 논합니다.",
    dimensions: ["MERITOCRACY"],
    tags: ["성과급", "보상", "동기부여"],
  }),
  ControversialTopic.create({
    id: "mc-05",
    title: "공무원 정년 보장 제도를 폐지해야 하는가?",
    description: "고용 안정과 공직 경쟁력 사이의 균형을 논합니다.",
    dimensions: ["MERITOCRACY", "WORK_LIFE"],
    tags: ["공무원", "정년", "경쟁"],
  }),
  ControversialTopic.create({
    id: "mc-06",
    title: "인턴에게도 최저임금 이상을 반드시 지급해야 하는가?",
    description: "청년 노동 착취 방지와 취업 기회 확대 사이의 갈등을 논합니다.",
    dimensions: ["MERITOCRACY", "REDISTRIBUTION"],
    tags: ["인턴", "무급노동", "청년"],
  }),
  ControversialTopic.create({
    id: "mc-07",
    title: "비정규직과 정규직의 임금 격차를 법으로 제한해야 하는가?",
    description: "동일 노동 동일 임금 원칙의 실현 가능성과 부작용을 논합니다.",
    dimensions: ["MERITOCRACY", "REDISTRIBUTION"],
    tags: ["비정규직", "임금격차", "평등"],
  }),
  ControversialTopic.create({
    id: "mc-08",
    title: "부모의 재력이 자녀 교육에 미치는 영향을 제한해야 하는가?",
    description: "사교육비 규제와 교육 자유 사이의 긴장을 다룹니다.",
    dimensions: ["MERITOCRACY", "OPPORTUNITY_EQUALITY"],
    tags: ["사교육", "교육격차", "기회균등"],
  }),

  // ── TECH_OPTIMISM (9) ──
  ControversialTopic.create({
    id: "to-01",
    title: "AI가 의사의 진단을 대체해도 되는가?",
    description: "AI 의료의 정확성과 인간 의사의 판단력 사이의 갈등을 논합니다.",
    dimensions: ["TECH_OPTIMISM", "TECH_REGULATION"],
    tags: ["AI", "의료", "진단"],
  }),
  ControversialTopic.create({
    id: "to-02",
    title: "로봇이 인간의 일자리를 대체한다면 로봇세를 부과해야 하는가?",
    description: "자동화 시대의 재정 정책과 기술 발전의 균형을 논합니다.",
    dimensions: ["TECH_OPTIMISM", "REDISTRIBUTION"],
    tags: ["로봇세", "자동화", "일자리"],
  }),
  ControversialTopic.create({
    id: "to-03",
    title: "유전자 편집으로 질병을 예방하는 것을 허용해야 하는가?",
    description: "유전자 치료의 윤리적 경계와 의료 혁신을 논합니다.",
    dimensions: ["TECH_OPTIMISM"],
    tags: ["유전자편집", "윤리", "의료혁신"],
  }),
  ControversialTopic.create({
    id: "to-04",
    title: "화성 이주 프로젝트에 국가 예산을 투입해야 하는가?",
    description: "우주 개발의 장기적 가치와 당장의 사회 문제 해결 사이의 우선순위를 논합니다.",
    dimensions: ["TECH_OPTIMISM"],
    tags: ["우주", "화성", "예산"],
  }),
  ControversialTopic.create({
    id: "to-05",
    title: "메타버스 수업이 실제 교실을 대체할 수 있는가?",
    description: "가상 교육의 효과성과 대면 교육의 가치를 비교합니다.",
    dimensions: ["TECH_OPTIMISM", "OPPORTUNITY_EQUALITY"],
    tags: ["메타버스", "교육", "가상현실"],
  }),
  ControversialTopic.create({
    id: "to-06",
    title: "원자력 발전을 확대해야 하는가?",
    description: "탄소중립 달성을 위한 원전의 역할과 안전성 우려를 논합니다.",
    dimensions: ["TECH_OPTIMISM", "TECH_REGULATION"],
    tags: ["원자력", "에너지", "탄소중립"],
  }),
  ControversialTopic.create({
    id: "to-07",
    title: "뇌에 칩을 이식하는 기술을 상용화해도 되는가?",
    description: "뇌-컴퓨터 인터페이스의 가능성과 인간성 훼손 우려를 다룹니다.",
    dimensions: ["TECH_OPTIMISM", "TECH_REGULATION"],
    tags: ["BCI", "뇌과학", "인간성"],
  }),
  ControversialTopic.create({
    id: "to-08",
    title: "AI가 만든 예술 작품에 저작권을 부여해야 하는가?",
    description: "AI 창작물의 법적 지위와 인간 예술가의 권리를 논합니다.",
    dimensions: ["TECH_OPTIMISM", "TECH_REGULATION"],
    tags: ["AI", "저작권", "예술"],
  }),
  ControversialTopic.create({
    id: "to-09",
    title: "완전 자율주행차가 상용화되면 운전면허를 폐지해야 하는가?",
    description: "기술 신뢰와 인간 통제권 사이의 균형을 논합니다.",
    dimensions: ["TECH_OPTIMISM", "TECH_REGULATION"],
    tags: ["자율주행", "운전면허", "기술신뢰"],
  }),

  // ── OPPORTUNITY_EQUALITY (8) ──
  ControversialTopic.create({
    id: "oe-01",
    title: "기업 이사회에 여성 할당제를 도입해야 하는가?",
    description: "성별 다양성 확보와 역차별 우려 사이의 갈등을 논합니다.",
    dimensions: ["OPPORTUNITY_EQUALITY"],
    tags: ["여성할당제", "다양성", "기업"],
  }),
  ControversialTopic.create({
    id: "oe-02",
    title: "장애인 의무고용률을 현재의 2배로 올려야 하는가?",
    description: "장애인 고용 확대와 기업 부담 사이의 균형을 논합니다.",
    dimensions: ["OPPORTUNITY_EQUALITY"],
    tags: ["장애인고용", "의무고용", "포용"],
  }),
  ControversialTopic.create({
    id: "oe-03",
    title: "수도권 대학 정원을 줄이고 지방대를 지원해야 하는가?",
    description: "지역 균형 발전과 교육 선택의 자유를 논합니다.",
    dimensions: ["OPPORTUNITY_EQUALITY", "MERITOCRACY"],
    tags: ["지방대", "지역균형", "대학"],
  }),
  ControversialTopic.create({
    id: "oe-04",
    title: "다문화 가정 자녀에게 추가 교육 지원을 해야 하는가?",
    description: "다문화 포용 정책과 역차별 논란을 다룹니다.",
    dimensions: ["OPPORTUNITY_EQUALITY"],
    tags: ["다문화", "교육지원", "포용"],
  }),
  ControversialTopic.create({
    id: "oe-05",
    title: "농어촌 학생에게 대학 특별전형을 확대해야 하는가?",
    description: "지역 교육 격차 해소와 입시 공정성 사이의 갈등을 논합니다.",
    dimensions: ["OPPORTUNITY_EQUALITY", "MERITOCRACY"],
    tags: ["농어촌전형", "교육격차", "입시"],
  }),
  ControversialTopic.create({
    id: "oe-06",
    title: "디지털 기기를 다루지 못하는 고령자를 위한 별도 창구를 의무화해야 하는가?",
    description: "디지털 전환 속 고령자 소외와 효율성의 균형을 다룹니다.",
    dimensions: ["OPPORTUNITY_EQUALITY", "TECH_OPTIMISM"],
    tags: ["디지털격차", "고령자", "접근성"],
  }),
  ControversialTopic.create({
    id: "oe-07",
    title: "저소득층 자녀에게 사교육비를 국가가 지원해야 하는가?",
    description: "교육 격차 해소 방안으로서 사교육 지원의 적절성을 논합니다.",
    dimensions: ["OPPORTUNITY_EQUALITY", "REDISTRIBUTION"],
    tags: ["사교육", "저소득층", "교육지원"],
  }),
  ControversialTopic.create({
    id: "oe-08",
    title: "군 복무를 남녀 모두에게 의무화해야 하는가?",
    description: "국방의 의무와 성평등 사이의 갈등을 논합니다.",
    dimensions: ["OPPORTUNITY_EQUALITY"],
    tags: ["군복무", "성평등", "국방"],
  }),
];

export class InMemoryTopicRepository implements TopicRepository {
  async findAll(): Promise<ControversialTopic[]> {
    return [...SEED_TOPICS];
  }

  async findById(id: string): Promise<ControversialTopic | null> {
    return SEED_TOPICS.find((t) => t.id === id) ?? null;
  }

  async findByDimension(
    dimension: StanceDimension,
  ): Promise<ControversialTopic[]> {
    return SEED_TOPICS.filter((t) => t.dimensions.includes(dimension));
  }
}
