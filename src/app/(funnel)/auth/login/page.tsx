"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/app/_shared/hooks/useAuth";
import { PrimaryButton } from "@/app/_shared/components/PrimaryButton";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, loginWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
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
      const next = searchParams.get("next") || "/friends";
      router.push(next);
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
            이메일을 입력하면 바로 시작됩니다
          </p>
        </motion.div>

        {/* Login form */}
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
            시작하기
          </PrimaryButton>
        </motion.form>

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
