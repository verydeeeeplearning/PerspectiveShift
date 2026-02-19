export const MICROCOPY_CONTEXTS = [
  "loading", "waiting", "reflection-enter", "dialogue-end",
] as const;

export type MicrocopyContext = (typeof MICROCOPY_CONTEXTS)[number];

export const MICROCOPY_TONES = ["safety", "autonomy", "curiosity", "competence"] as const;
export type MicrocopyTone = (typeof MICROCOPY_TONES)[number];

const MICROCOPY_POOL: Array<{ text: string; tone: MicrocopyTone }> = [
  { text: "설득이 아니라, 이해가 목표예요.", tone: "safety" },
  { text: "불편하면 언제든 난이도를 낮출 수 있어요.", tone: "autonomy" },
  { text: "상대는 당신의 개인정보를 모릅니다.", tone: "safety" },
  { text: "오늘은 가볍게 5분만 해도 충분해요.", tone: "autonomy" },
  { text: "대화 후엔 한 장 요약 카드가 남아요.", tone: "competence" },
  { text: "오늘의 발견이 내일의 당신을 조금 바꿀 수 있어요.", tone: "curiosity" },
];

export class Microcopy {
  readonly text: string;
  readonly tone: MicrocopyTone;
  readonly context: MicrocopyContext;

  private constructor(text: string, tone: MicrocopyTone, context: MicrocopyContext) {
    this.text = text;
    this.tone = tone;
    this.context = context;
  }

  static forContext(context: MicrocopyContext, index?: number): Microcopy {
    const idx = index !== undefined ? index % MICROCOPY_POOL.length : Math.floor(Math.random() * MICROCOPY_POOL.length);
    const entry = MICROCOPY_POOL[idx];
    return new Microcopy(entry.text, entry.tone, context);
  }

  static allCopies(): Array<{ text: string; tone: MicrocopyTone }> {
    return [...MICROCOPY_POOL];
  }
}
