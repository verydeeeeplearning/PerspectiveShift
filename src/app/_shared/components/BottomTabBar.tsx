"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/app/_shared/hooks/useAuth";
import { springSnappy } from "@/app/_shared/motion";

interface Tab {
  label: string;
  href: string;
  activePattern: string;
  iconPath: string;
  filledIconPath?: string;
}

function TabIcon({ path, filled, isActive }: { path: string; filled?: string; isActive: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={isActive && filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={isActive ? "2" : "1.75"}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={isActive && filled ? filled : path} />
    </svg>
  );
}

function isActive(pathname: string, pattern: string): boolean {
  if (pattern === pathname) return true;
  return pathname.startsWith(pattern + "/");
}

const ANONYMOUS_TABS: Tab[] = [
  {
    label: "매칭",
    href: "/matching",
    activePattern: "/matching",
    iconPath: "M12 2 L12 2 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z",
  },
  {
    label: "대화",
    href: "/dialogue",
    activePattern: "/dialogue",
    iconPath: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  },
  {
    label: "로그인",
    href: "/auth/login",
    activePattern: "/auth/login",
    iconPath: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  },
];

const AUTHENTICATED_TABS: Tab[] = [
  {
    label: "매칭",
    href: "/matching",
    activePattern: "/matching",
    iconPath: "M12 2 L12 2 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z",
  },
  {
    label: "대화",
    href: "/dialogue",
    activePattern: "/dialogue",
    iconPath: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  },
  {
    label: "친구",
    href: "/friends",
    activePattern: "/friends",
    iconPath: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  },
  {
    label: "더보기",
    href: "/profile",
    activePattern: "/profile",
    iconPath: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  },
];

const MORE_PATTERNS = ["/profile", "/safety", "/offline"];

export function BottomTabBar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const tabs = isAuthenticated ? AUTHENTICATED_TABS : ANONYMOUS_TABS;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom)]"
      role="tablist"
      aria-label="메인 네비게이션"
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 glass border-t border-white/20" />

      <div className="relative flex h-16 items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active =
            tab.label === "더보기"
              ? MORE_PATTERNS.some((p) => isActive(pathname, p))
              : isActive(pathname, tab.activePattern);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={active}
              aria-label={tab.label}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
            >
              {/* Animated active pill background */}
              {active && (
                <motion.div
                  layoutId="tab-active-pill"
                  className="absolute -top-0.5 w-12 h-1 rounded-full bg-indigo-depth"
                  transition={springSnappy}
                />
              )}

              {/* Icon with spring animation */}
              <motion.div
                animate={{
                  scale: active ? 1 : 0.9,
                  color: active ? "var(--color-indigo-depth)" : "var(--color-text-tertiary)",
                }}
                whileTap={{ scale: 0.8 }}
                transition={springSnappy}
                className="relative"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? "2" : "1.75"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {tab.iconPath.split(" M").map((segment, i) => (
                    <path key={i} d={i === 0 ? segment : `M${segment}`} />
                  ))}
                </svg>

                {/* Active dot indicator */}
                {active && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-primary"
                    transition={springSnappy}
                  />
                )}
              </motion.div>

              {/* Label */}
              <motion.span
                animate={{
                  color: active ? "var(--color-indigo-depth)" : "var(--color-text-tertiary)",
                  fontWeight: active ? 600 : 500,
                }}
                className="text-[11px]"
              >
                {tab.label}
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
