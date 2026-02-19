"use client";

interface ChatBubbleProps {
  content: string;
  isMine: boolean;
  createdAt: string;
}

export function ChatBubble({ content, isMine, createdAt }: ChatBubbleProps) {
  const time = new Date(createdAt).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl ${
          isMine
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-900 rounded-bl-sm"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        <p
          className={`text-xs mt-1 ${
            isMine ? "text-blue-200" : "text-gray-400"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
