"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/app/_shared/hooks/useAuth";
import { PrimaryButton } from "@/app/_shared/components/PrimaryButton";
import { PaperCard } from "@/app/_shared/components/PaperCard";

export default function LoginPage() {
  const { loading, loginWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setSent(true);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-border-soft border-t-indigo-depth" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-[var(--container-x)]">
      <div className="max-w-sm w-full space-y-8">
        {/* Header */}
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-[28px] leading-[1.2] font-bold font-heading text-text-primary tracking-[-0.02em]">
            PerspectiveShift
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            이메일로 간편하게 로그인하세요
          </p>
        </motion.div>

        {sent ? (
          /* Success state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <PaperCard padding="spacious">
              <div className="text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-status-safety/10 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-status-safety)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h2 className="text-lg font-heading font-semibold text-text-primary">
                  메일을 확인하세요
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  <span className="font-medium text-text-primary">{email}</span>
                  <br />
                  로 로그인 링크를 보냈습니다.
                  <br />
                  메일함을 확인해주세요.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                  className="text-sm text-text-tertiary hover:text-text-secondary transition-colors underline underline-offset-2"
                >
                  다른 이메일로 다시 시도
                </button>
              </div>
            </PaperCard>
          </motion.div>
        ) : (
          /* Login form */
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                이메일 주소
              </label>
              <input
                id="email"
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
              로그인 링크 받기
            </PrimaryButton>
          </motion.form>
        )}

        {/* Footer */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
