
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
  const scrollTimeoutRef = useRef<number | null>(null);

  // Immediate scroll function without delay
  const scrollToBottom = (behavior: ScrollBehavior = "instant") => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Don't use a timeout for scrolling
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Use useEffect to scroll immediately when messages change
  useEffect(() => {
    // Always scroll on new messages, use instant scrolling for optimal speed
    scrollToBottom("instant");

    // Cleanup function for unmounting
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages]); // Only depend on messages array

  return (
    <div className="absolute inset-0 overflow-y-auto pb-32">
      <div className="flex flex-col gap-4 p-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            isCurrentUser={message.user_id === currentUserId}
            onCopy={() => onCopyMessage(message.content)}
            isLastInGroup={
              index === messages.length - 1 || 
              messages[index + 1]?.role !== message.role
            }
          />
        ))}
        
        {isLoading && (
          <div className="flex w-full gap-2 p-2 justify-start animate-fade-in">
            <div className="flex max-w-[80%] flex-col gap-1 rounded-xl px-3 py-2 sm:px-4 sm:py-2 bg-chat-ai-gradient text-white border border-white/5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="animate-pulse w-2 h-2 bg-brand-gold rounded-full"></div>
                  <div className="animate-pulse w-2 h-2 bg-brand-gold rounded-full delay-150"></div>
                  <div className="animate-pulse w-2 h-2 bg-brand-gold rounded-full delay-300"></div>
                </div>
                <span className="text-xs sm:text-sm text-gray-300">Searching the contract...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
