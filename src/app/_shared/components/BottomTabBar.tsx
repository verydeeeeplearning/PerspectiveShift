"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/_shared/hooks/useAuth";

interface Tab {
  label: string;
  href: string;
  activePattern: string;
  icon: React.ReactNode;
}

const CompassIcon = ({ active }: { active: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "currentColor" : "#9CA3AF"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const ChatIcon = ({ active }: { active: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "currentColor" : "#9CA3AF"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const UsersIcon = ({ active }: { active: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "currentColor" : "#9CA3AF"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const UserIcon = ({ active }: { active: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "currentColor" : "#9CA3AF"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

function isActive(pathname: string, pattern: string): boolean {
  if (pattern === pathname) return true;
  return pathname.startsWith(pattern + "/");
}

const ANONYMOUS_TABS: Tab[] = [
  {
    label: "매칭",
    href: "/matching",
    activePattern: "/matching",
    icon: <CompassIcon active={false} />,
  },
  {
    label: "대화",
    href: "/dialogue",
    activePattern: "/dialogue",
    icon: <ChatIcon active={false} />,
  },
  {
    label: "로그인",
    href: "/auth/login",
    activePattern: "/auth/login",
    icon: <UserIcon active={false} />,
  },
];

const AUTHENTICATED_TABS: Tab[] = [
  {
    label: "매칭",
    href: "/matching",
    activePattern: "/matching",
    icon: <CompassIcon active={false} />,
  },
  {
    label: "대화",
    href: "/dialogue",
    activePattern: "/dialogue",
    icon: <ChatIcon active={false} />,
  },
  {
    label: "친구",
    href: "/friends",
    activePattern: "/friends",
    icon: <UsersIcon active={false} />,
  },
  {
    label: "더보기",
    href: "/profile",
    activePattern: "/profile",
    icon: <UserIcon active={false} />,
  },
];

const MORE_PATTERNS = ["/profile", "/safety", "/offline"];

export function BottomTabBar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const tabs = isAuthenticated ? AUTHENTICATED_TABS : ANONYMOUS_TABS;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 h-16 bg-white border-t border-gray-200 z-50 pb-[env(safe-area-inset-bottom)]"
      role="tablist"
      aria-label="메인 네비게이션"
    >
      <div className="flex h-full items-center justify-around max-w-lg mx-auto">
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
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                active ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {tab.label === "매칭" && <CompassIcon active={active} />}
              {tab.label === "대화" && <ChatIcon active={active} />}
              {tab.label === "친구" && <UsersIcon active={active} />}
              {(tab.label === "로그인" || tab.label === "더보기") && (
                <UserIcon active={active} />
              )}
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
