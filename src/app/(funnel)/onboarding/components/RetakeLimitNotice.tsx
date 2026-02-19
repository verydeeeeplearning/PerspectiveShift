"use client";

interface RetakeLimitNoticeProps {
  allowed: boolean;
  message?: string;
  warning?: string;
}

export function RetakeLimitNotice({
  allowed,
  message,
  warning,
}: RetakeLimitNoticeProps) {
  if (allowed && !warning) {
    return null;
  }

  if (!allowed && message) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {message}
      </div>
    );
  }

  if (warning) {
    return (
      <div
        role="status"
        className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
      >
        {warning}
      </div>
    );
  }

  return null;
}
