import { Message } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";
import { useEffect, useRef } from "react";

interface ChatListProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  onCopyMessage: (content: string) => void;
}

export function ChatList({ messages, currentUserId, isLoading, onCopyMessage }: ChatListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length === 0) {
      scrollToTop();
    } else {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    console.log("Messages state updated:", messages.length, "messages");
    
    if (messages.length > 0) {
      try {
        localStorage.setItem("chat-messages", JSON.stringify(messages));
        console.log("Messages saved to localStorage successfully");
      } catch (error) {
        console.error("Error saving messages to localStorage:", error);
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isCurrentUser={message.user_id === currentUserId}
              onCopy={() => onCopyMessage(message.content)}
            />
          ))}
          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="flex max-w-[80%] flex-col gap-1 rounded-lg px-3 py-2 bg-white/5 text-white">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <div className="animate-pulse w-1.5 h-1.5 bg-blue-500 rounded-full delay-150"></div>
                  <div className="animate-pulse w-1.5 h-1.5 bg-blue-500 rounded-full delay-300"></div>
                  <span className="text-xs ml-2">Searching the contract...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}