import { Message } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";
import { useEffect, useRef } from "react";

interface ChatListProps {
  messages: Message[];
  currentUserId: string;
}

export function ChatList({ messages, currentUserId }: ChatListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col gap-2 p-4 overflow-y-auto">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          isCurrentUser={message.user_id === currentUserId}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}