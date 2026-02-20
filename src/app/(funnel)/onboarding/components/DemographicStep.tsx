"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PrimaryButton } from "@/app/_shared/components/PrimaryButton";
import { PaperCard } from "@/app/_shared/components/PaperCard";

export interface DemographicInfo {
  ageGroup: string;
  jobCategory: string;
}

interface DemographicStepProps {
  onComplete: (info: DemographicInfo) => void;
}

const AGE_GROUPS = ["10대", "20대", "30대", "40대", "50대", "60대 이상"];

const JOB_CATEGORIES = [
  "학생",
  "IT/개발",
  "교육",
  "사무/경영",
  "전문직",
  "자영업",
  "프리랜서/창작",
  "기타",
];

function SelectionChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`
        px-4 py-2.5 rounded-pill text-sm font-medium transition-colors
        ${
          selected
            ? "bg-indigo-depth text-text-inverse shadow-sm"
            : "bg-surface-card border border-border-soft text-text-secondary hover:border-indigo-depth/30 hover:text-text-primary"
        }
      `.trim()}
      whileTap={{ scale: 0.95 }}
    >
      {label}
    </motion.button>
  );
}

export function DemographicStep({ onComplete }: DemographicStepProps) {
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [jobCategory, setJobCategory] = useState<string | null>(null);

  const canProceed = ageGroup !== null && jobCategory !== null;

  const handleSubmit = () => {
    if (!canProceed) return;
    onComplete({ ageGroup: ageGroup!, jobCategory: jobCategory! });
  };

  return (
    <section className="mx-auto w-full max-w-xl space-y-8">
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold font-heading text-text-primary tracking-[-0.02em]">
          기본 정보
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          더 정확한 성향 분석과 매칭을 위해 간단한 정보를 알려주세요
        </p>
      </motion.div>

      {/* Age Group */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <PaperCard padding="spacious">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-text-primary">
              연령대
            </h3>
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map((age) => (
                <SelectionChip
                  key={age}
                  label={age}
                  selected={ageGroup === age}
                  onClick={() => setAgeGroup(age)}
                />
              ))}
            </div>
          </div>
        </PaperCard>
      </motion.div>

      {/* Job Category */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <PaperCard padding="spacious">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-text-primary">
              직업군
            </h3>
            <div className="flex flex-wrap gap-2">
              {JOB_CATEGORIES.map((job) => (
                <SelectionChip
                  key={job}
                  label={job}
                  selected={jobCategory === job}
                  onClick={() => setJobCategory(job)}
                />
              ))}
            </div>
          </div>
        </PaperCard>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <PrimaryButton
          fullWidth
          onClick={handleSubmit}
          disabled={!canProceed}
        >
          다음으로
        </PrimaryButton>
        <p className="mt-3 text-xs text-text-tertiary">
          이 정보는 매칭에만 사용되며, 다른 사용자에게 공개되지 않습니다
        </p>
      </motion.div>
    </section>
  );
}
