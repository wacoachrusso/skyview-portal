
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

  // This function will only scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when new messages are added, but don't prevent scrolling back up
  useEffect(() => {
    // Only auto-scroll if already at the bottom or new message is from current user
    if (messages.length > 0) {
      const container = containerRef.current;
      const isAtBottom = container ? 
        Math.abs((container.scrollHeight - container.scrollTop) - container.clientHeight) < 50 : 
        true;
      
      const lastMessage = messages[messages.length - 1];
      const isUserMessage = lastMessage.user_id === currentUserId;
      
      if (isAtBottom || isUserMessage || isLoading) {
        scrollToBottom();
      }
    }
  }, [messages, currentUserId, isLoading]);

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={containerRef} 
        className="flex-1 overflow-y-auto overscroll-contain touch-pan-y pb-20"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="flex flex-col gap-2 p-2 sm:p-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isCurrentUser={message.user_id === currentUserId}
              onCopy={() => onCopyMessage(message.content)}
            />
          ))}
          {isLoading && (
            <div className="flex w-full gap-2 p-2 justify-start">
              <div className="flex max-w-[80%] flex-col gap-1 rounded-lg px-3 py-2 sm:px-4 sm:py-2 bg-white/5 text-white">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                  <div className="animate-pulse w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full delay-150"></div>
                  <div className="animate-pulse w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full delay-300"></div>
                  <span className="text-xs sm:text-sm ml-2">Searching the contract...</span>
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
