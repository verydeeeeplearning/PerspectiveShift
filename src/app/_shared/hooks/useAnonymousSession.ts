"use client";

import { useState, useEffect } from "react";

const SESSION_KEY = "ps-session-id";

export function useAnonymousSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    setSessionId(id);
  }, []);

  return { sessionId, isReady: sessionId !== null };
}
