// src/components/ChatContainer.tsx
import React, { useEffect, useRef } from "react";
import { Message } from "@/types/chat";
import ChatMessage from "./ChatMessage";
import { WelcomeMessage } from "./WelcomeMessage";

interface ChatContainerProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  onCopyMessage: (content: string) => void;
  onSelectQuestion?: (question: string) => void;
}

export function ChatContainer({
  messages,
  currentUserId,
  isLoading = false,
  onCopyMessage,
  onSelectQuestion,
}: ChatContainerProps) {
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 h-full overflow-y-auto px-4 pb-10">
      {messages.length === 0 ? (
        <div className="h-full overflow-y-auto pt-4 space-y-4">
          <WelcomeMessage onSelectQuestion={onSelectQuestion} />
        </div>
      ) : (
        <div className="w-full py-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              onCopyMessage={onCopyMessage}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}

export default ChatContainer;