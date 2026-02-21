"use client";

import { motion } from "framer-motion";
import { springSnappy } from "@/app/_shared/motion";
import { AnimatedListItem } from "@/app/_shared/components/AnimatedList";

interface PersonaCard {
  id: string;
  name: string;
  ageGroup: string;
  jobCategory: string;
  stanceLabel: string;
  description: string;
}

interface PersonaSelectorProps {
  personas: PersonaCard[];
  onSelect: (personaId: string) => void;
  onRequestNotification?: () => void;
}

const STYLE_COLORS: Record<string, string> = {
  "경제 보수": "bg-semantic-difference-soft text-semantic-difference",
  "사회 진보": "bg-semantic-similarity-soft text-semantic-similarity",
  "중도": "bg-accent-primary-soft text-accent-primary",
  "기술 낙관": "bg-blue-50 text-blue-700",
  "복지 확대": "bg-emerald-50 text-emerald-700",
  "자유 시장": "bg-amber-50 text-amber-700",
  "사회 변혁": "bg-rose-50 text-rose-700",
  "데이터 중심": "bg-slate-100 text-slate-700",
  "개인 자유": "bg-violet-50 text-violet-700",
  "전통 가치": "bg-stone-100 text-stone-700",
};

function getAvatarColor(index: number) {
  const colors = [
    "bg-semantic-difference-soft text-semantic-difference",
    "bg-semantic-similarity-soft text-semantic-similarity",
    "bg-accent-primary-soft text-accent-primary",
  ];
  return colors[index % colors.length];
}

export function PersonaSelector({ personas, onSelect, onRequestNotification }: PersonaSelectorProps) {
  return (
    <motion.div
      className="space-y-5"
      role="region"
      aria-label="대화 상대 선택"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-accent-primary-soft flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        </div>
        <h2 className="text-lg font-heading font-semibold text-text-primary">
          대화 상대를 선택하세요
        </h2>
        <p className="text-sm text-text-secondary">
          다양한 관점을 가진 상대와 구조화된 대화를 시작할 수 있어요
        </p>
      </div>

      {/* Persona cards */}
      <div className="grid gap-3">
        {personas.map((p, idx) => (
          <AnimatedListItem key={p.id} index={idx}>
            <motion.button
              className="w-full text-left p-4 rounded-card border border-border-soft bg-surface-card shadow-paper"
              onClick={() => onSelect(p.id)}
              aria-label={`${p.name}과 대화하기`}
              whileHover={{
                y: -2,
                boxShadow: "0 4px 16px rgba(44, 62, 80, 0.08)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={springSnappy}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${getAvatarColor(idx)}`}>
                  {p.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-text-primary">{p.name}</h3>
                    <span className="text-indigo-depth text-sm font-medium flex items-center gap-0.5">
                      대화하기
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {p.ageGroup} · {p.jobCategory}
                  </p>
                  <span className={`inline-block mt-1.5 px-2 py-0.5 text-[11px] font-medium rounded-pill ${STYLE_COLORS[p.stanceLabel] ?? "bg-border-divider text-text-secondary"}`}>
                    {p.stanceLabel}
                  </span>
                  <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>
            </motion.button>
          </AnimatedListItem>
        ))}
      </div>

      {/* Notification opt-in */}
      {onRequestNotification && (
        <motion.button
          className="w-full text-center text-sm text-text-tertiary py-2 hover:text-text-secondary transition-colors"
          onClick={onRequestNotification}
          whileTap={{ scale: 0.98 }}
        >
          새로운 대화 상대가 오면 알림 받기
        </motion.button>
      )}
    </motion.div>
  );
}
