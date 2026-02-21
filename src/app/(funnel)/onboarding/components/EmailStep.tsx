"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/_shared/hooks/useAuth";
import { PrimaryButton } from "@/app/_shared/components/PrimaryButton";
import { PaperCard } from "@/app/_shared/components/PaperCard";

interface EmailStepProps {
  onComplete: () => void;
}

export function EmailStep({ onComplete }: EmailStepProps) {
  const { loginWithEmail, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already logged in — skip this step (deferred to avoid state update during parent render)
  useEffect(() => {
    if (isAuthenticated) {
      requestAnimationFrame(() => onComplete());
    }
  }, [isAuthenticated, onComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setError(null);

    const result = await loginWithEmail(email.trim());
    setSending(false);

    if (result.error) {
      setError(result.error);
    } else {
      onComplete();
    }
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
          시작하기
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          이메일을 입력하면 결과를 저장하고 나중에 다시 볼 수 있어요
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <PaperCard padding="spacious">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="onboarding-email"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                이메일 주소
              </label>
              <input
                id="onboarding-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                autoComplete="email"
                className="w-full h-12 px-4 rounded-card border border-border-soft bg-surface-card text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-indigo-depth/30 focus:border-indigo-depth transition-colors"
              />
            </div>

            {error && (
              <motion.p
                className="text-sm text-semantic-difference"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}

            <PrimaryButton
              fullWidth
              type="submit"
              loading={sending}
              disabled={!email.trim()}
            >
              계속하기
            </PrimaryButton>
          </form>
        </PaperCard>
      </motion.div>

      <p className="text-center text-xs text-text-tertiary">
        이 정보는 결과 저장에만 사용되며, 마케팅에 활용되지 않습니다
      </p>
    </section>
  );
}
