"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiAuthGet } from "@/app/_shared/api-client";
import Link from "next/link";
import { PaperCard } from "@/app/_shared/components/PaperCard";
import { CardSkeleton } from "@/app/_shared/components/Skeleton";
import { AnimatedListItem } from "@/app/_shared/components/AnimatedList";

interface FriendItem {
  friendshipId: string;
  friendUserId: string;
  status: string;
  dialogueCount: number;
  createdAt: string;
}

function getStageLabel(dialogueCount: number): { label: string; color: string } {
  if (dialogueCount >= 3) return { label: "오프라인 준비", color: "text-semantic-similarity" };
  if (dialogueCount >= 1) return { label: "실시간 대화 단계", color: "text-accent-primary" };
  return { label: "친구 단계", color: "text-text-secondary" };
}

function getInitialAvatar(userId: string) {
  const colors = [
    "bg-accent-primary-soft text-accent-primary",
    "bg-semantic-similarity-soft text-semantic-similarity",
    "bg-semantic-difference-soft text-semantic-difference",
    "bg-accent-warm-soft text-accent-warm",
  ];
  const idx = userId.charCodeAt(0) % colors.length;
  return colors[idx];
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiAuthGet<{ friends: FriendItem[] }>("/api/relationship/friends")
      .then((data) => setFriends(data.friends))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="p-6 max-w-2xl mx-auto space-y-4">
        <div className="space-y-2">
          <div className="skeleton h-3 w-10" />
          <div className="skeleton h-7 w-28" />
        </div>
        <CardSkeleton />
        <CardSkeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-semantic-difference-soft border border-semantic-difference/20 text-semantic-difference p-4 rounded-card"
        >
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-1">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-accent-primary">
            친구
          </span>
          <h1 className="text-2xl font-bold font-heading text-text-primary tracking-[-0.02em]">
            친구 목록
          </h1>
        </div>
        <Link
          href="/matching"
          className="text-indigo-depth font-medium text-sm hover:underline inline-flex items-center gap-1"
        >
          새 대화 시작
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </motion.div>

      {/* Empty state */}
      {friends.length === 0 ? (
        <motion.div
          className="text-center py-16 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-primary-soft flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-lg text-text-primary font-heading font-semibold">
            아직 친구가 없습니다
          </p>
          <p className="text-sm text-text-tertiary">
            대화를 완료한 후 친구 요청을 보내보세요
          </p>
        </motion.div>
      ) : (
        <ul className="space-y-3">
          {friends.map((f, idx) => {
            const stage = getStageLabel(f.dialogueCount);
            const avatarColor = getInitialAvatar(f.friendUserId);
            const initials = f.friendUserId.slice(0, 2).toUpperCase();

            return (
              <AnimatedListItem key={f.friendshipId} index={idx}>
                <li>
                  <Link href={`/friends/${f.friendshipId}`}>
                    <PaperCard variant="interactive">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarColor}`}>
                          {initials}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary truncate">
                            참여자_{f.friendUserId.slice(0, 4).toUpperCase()}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-text-tertiary num">
                              대화 {f.dialogueCount}회
                            </span>
                            <span className="w-1 h-1 rounded-full bg-border-soft" />
                            <span className={`text-[11px] font-medium ${stage.color}`}>
                              {stage.label}
                            </span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </PaperCard>
                  </Link>
                </li>
              </AnimatedListItem>
            );
          })}
        </ul>
      )}
    </main>
  );
}
