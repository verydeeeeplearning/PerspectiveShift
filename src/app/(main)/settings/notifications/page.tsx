"use client";

import { useEffect, useMemo, useState } from "react";

type NotificationChannel = "d1_review" | "matching_available" | "persona_alert" | "weekly_insight";
type NotificationConfig = Record<NotificationChannel, boolean>;

const DEFAULT_CONFIG: NotificationConfig = {
  d1_review: true,
  matching_available: true,
  persona_alert: true,
  weekly_insight: false,
};

const STORAGE_KEY = "ps-notification-config";
const SNOOZE_KEY = "ps-notification-snooze-until";

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  d1_review: "D+1 복기",
  matching_available: "매칭 가능",
  persona_alert: "페르소나 알림",
  weekly_insight: "주간 인사이트",
};

export default function NotificationSettingsPage() {
  const [config, setConfig] = useState<NotificationConfig>(DEFAULT_CONFIG);
  const [snoozeUntil, setSnoozeUntil] = useState<string | null>(null);

  useEffect(() => {
    const rawConfig = localStorage.getItem(STORAGE_KEY);
    const rawSnooze = localStorage.getItem(SNOOZE_KEY);
    if (rawConfig) {
      try {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(rawConfig) });
      } catch {
        setConfig(DEFAULT_CONFIG);
      }
    }
    if (rawSnooze) {
      setSnoozeUntil(rawSnooze);
    }
  }, []);

  const isSnoozed = useMemo(() => {
    if (!snoozeUntil) return false;
    return new Date(snoozeUntil).getTime() > Date.now();
  }, [snoozeUntil]);

  const toggleChannel = (channel: NotificationChannel) => {
    const next = { ...config, [channel]: !config[channel] };
    setConfig(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleSnoozeFor7Days = () => {
    const until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    setSnoozeUntil(until);
    localStorage.setItem(SNOOZE_KEY, until);
  };

  const handleRequestBrowserPermission = async () => {
    if (typeof Notification === "undefined" || !("requestPermission" in Notification)) {
      return;
    }
    const permission = await Notification.requestPermission();
    window.dispatchEvent(
      new CustomEvent("perspectiveshift:analytics", {
        detail: {
          type:
            permission === "granted"
              ? "notification_permission_granted"
              : "notification_permission_denied",
          payload: { timestamp: Date.now() },
        },
      }),
    );
  };

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900">알림 설정</h1>
      <p className="text-sm text-gray-600">
        필요한 알림만 켜두고, 원할 때 7일 동안 잠시 꺼둘 수 있어요.
      </p>

      <section className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
        {(Object.keys(CHANNEL_LABELS) as NotificationChannel[]).map((channel) => (
          <label key={channel} className="flex items-center justify-between gap-3 py-2">
            <span className="text-sm text-gray-800">{CHANNEL_LABELS[channel]}</span>
            <input
              type="checkbox"
              checked={config[channel]}
              onChange={() => toggleChannel(channel)}
              className="h-4 w-4"
            />
          </label>
        ))}
      </section>

      <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-700">
          상태:{" "}
          <span className="font-medium">
            {isSnoozed ? `7일 끄기 활성화 (${new Date(snoozeUntil as string).toLocaleDateString("ko-KR")}까지)` : "활성"}
          </span>
        </p>
        <button
          type="button"
          onClick={handleSnoozeFor7Days}
          className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          7일 끄기
        </button>
        <button
          type="button"
          onClick={handleRequestBrowserPermission}
          className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          브라우저 권한 요청
        </button>
      </section>
    </main>
  );
}
