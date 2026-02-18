"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/_shared/hooks/useAuth";
import { useRealtimeChat } from "@/app/_shared/hooks/useRealtimeChat";
import { apiAuthGet, apiAuthPost } from "@/app/_shared/api-client";
import { ChatBubble } from "./components/ChatBubble";
import { ChatInput } from "./components/ChatInput";
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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { messages: realtimeMessages, setMessages } = useRealtimeChat(friendshipId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.replace("/auth/login"); return; }

    apiAuthGet<ChatHistoryResponse>(`/api/chat/${friendshipId}/messages`)
      .then((data) => {
        setMessages(data.messages.reverse());
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [friendshipId, isAuthenticated, authLoading, router, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [realtimeMessages]);

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
    <main className="min-h-screen flex flex-col">
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
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={sending} />
    </main>
  );
}
