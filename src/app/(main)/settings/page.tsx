"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/app/_shared/hooks/useAuth";
import { PaperCard } from "@/app/_shared/components/PaperCard";

interface SettingItem {
  label: string;
  description: string;
  href: string;
  iconPath: string;
}

const SETTINGS_ITEMS: SettingItem[] = [
  {
    label: "내 데이터 관리",
    description: "데이터 다운로드, 삭제 요청",
    href: "/settings/data-management",
    iconPath: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  },
  {
    label: "알림 설정",
    description: "대화 알림, 매칭 알림 관리",
    href: "/settings/notifications",
    iconPath: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  },
];

export default function SettingsPage() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <motion.div
        className="mb-6 space-y-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold font-heading text-text-primary tracking-[-0.02em]">
          더보기
        </h1>
      </motion.div>

      {/* User info */}
      {isAuthenticated && user && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PaperCard padding="spacious">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-primary-soft flex items-center justify-center text-accent-primary font-bold text-sm">
                {(user.email?.[0] ?? "U").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </PaperCard>
        </motion.div>
      )}

      {/* Settings list */}
      <div className="space-y-3">
        {SETTINGS_ITEMS.map((item, idx) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
          >
            <Link href={item.href}>
              <PaperCard variant="interactive">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-base flex items-center justify-center text-text-secondary flex-shrink-0">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {item.iconPath.split(" M").map((segment, i) => (
                        <path key={i} d={i === 0 ? segment : `M${segment}`} />
                      ))}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary text-sm">
                      {item.label}
                    </p>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-text-tertiary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </PaperCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Logout */}
      {isAuthenticated && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full py-3 text-sm text-text-tertiary hover:text-semantic-difference transition-colors"
          >
            로그아웃
          </button>
        </motion.div>
      )}
    </main>
  );
}
