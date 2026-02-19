"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/app/_shared/hooks/useAuth";
import { useRealtimeChat } from "@/app/_shared/hooks/useRealtimeChat";
import { apiAuthGet, apiAuthPost } from "@/app/_shared/api-client";
import { ChatBubble } from "./components/ChatBubble";
import { ChatInput } from "./components/ChatInput";
import { MicroCheckinPrompt } from "./_components/MicroCheckinPrompt";
import Link from "next/link";

interface ChatMessage {
  id: string;
  friendshipId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface ChatHistoryResponse {
  messages: ChatMessage[];
  hasMore: boolean;
}

export default function ChatPage() {
  const { friendshipId } = useParams<{ friendshipId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { messages: realtimeMessages, setMessages } = useRealtimeChat(friendshipId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [checkinPrompt, setCheckinPrompt] = useState<string | null>(null);
  const chatStartRef = useRef<Date>(new Date());
  const checkinTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const CHECKIN_PROMPTS = [
    "지금까지 대화에서 가장 흥미로웠던 점은 무엇인가요?",
    "상대의 의견 중 새롭게 알게 된 것이 있나요?",
    "지금 기분이 어떤가요? 대화를 계속하고 싶으신가요?",
    "이 대화에서 가장 공감이 간 부분은 무엇인가요?",
    "상대방에게 더 알고 싶은 것이 있나요?",
  ];
  const checkinCountRef = useRef(0);

  const handleCheckinSubmit = useCallback((response: string) => {
    void response;
    setCheckinPrompt(null);
  }, []);

  const handleCheckinSkip = useCallback(() => {
    setCheckinPrompt(null);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    apiAuthGet<ChatHistoryResponse>(`/api/chat/${friendshipId}/messages`)
      .then((data) => {
        setMessages(data.messages.reverse());
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [friendshipId, authLoading, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [realtimeMessages]);

  useEffect(() => {
    checkinTimerRef.current = setInterval(() => {
      const idx = checkinCountRef.current % CHECKIN_PROMPTS.length;
      setCheckinPrompt(CHECKIN_PROMPTS[idx]);
      checkinCountRef.current++;
    }, 20 * 60 * 1000);
    return () => {
      if (checkinTimerRef.current) clearInterval(checkinTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async (content: string) => {
    if (!friendshipId) return;
    setSending(true);
    try {
      const msg = await apiAuthPost<ChatMessage>(
        `/api/chat/${friendshipId}/messages`,
        { content },
      );
      setMessages((prev) => [...prev, msg]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "전송 실패");
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) return <div className="p-6">로딩 중...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <main className="flex flex-col h-screen">
      <header className="p-4 border-b flex items-center gap-3">
        <Link href={`/friends/${friendshipId}`} className="text-blue-600">&larr;</Link>
        <h1 className="font-semibold">채팅</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {realtimeMessages.map((msg) => (
          <ChatBubble
            key={msg.id}
            content={msg.content}
            isMine={msg.senderId === user?.id}
            createdAt={msg.createdAt}
          />
        ))}
        {checkinPrompt && (
          <MicroCheckinPrompt
            prompt={checkinPrompt}
            onSubmit={handleCheckinSubmit}
            onSkip={handleCheckinSkip}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={sending} />
    </main>
  );
}
