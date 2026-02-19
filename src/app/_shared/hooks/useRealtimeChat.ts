"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface ChatMessagePayload {
  id: string;
  friendshipId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export function useRealtimeChat(friendshipId: string | null) {
  const [messages, setMessages] = useState<ChatMessagePayload[]>([]);

  const addMessage = useCallback((msg: ChatMessagePayload) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  useEffect(() => {
    if (!friendshipId) return;

    const channel = supabase.channel(`chat:${friendshipId}`);
    channel
      .on("broadcast", { event: "new_message" }, ({ payload }) => {
        addMessage(payload as ChatMessagePayload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [friendshipId, addMessage]);

  return { messages, setMessages, addMessage };
}
