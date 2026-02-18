const SESSION_KEY = "ps-session-id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(SESSION_KEY) ?? "";
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "X-Session-Id": getSessionId() },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T>(
  url: string,
  body: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": getSessionId(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}
