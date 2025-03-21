
import { Message } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";
import { useEffect, useRef, useLayoutEffect } from "react";

interface ChatListProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  onCopyMessage: (content: string) => void;
}

export function ChatList({ messages, currentUserId, isLoading, onCopyMessage }: ChatListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessagesLengthRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<number | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Use a very short timeout to ensure DOM updates first
    scrollTimeoutRef.current = window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
      scrollTimeoutRef.current = null;
    }, 10);
  };

  // Use useLayoutEffect to scroll before browser paints
  useLayoutEffect(() => {
    // Always scroll on new messages
    if (messages.length > previousMessagesLengthRef.current) {
      // Use instant scroll for initial load and smooth for new messages
      const behavior = previousMessagesLengthRef.current === 0 ? "auto" : "smooth";
      scrollToBottom(behavior);
      
      // Update the previous messages length reference
      previousMessagesLengthRef.current = messages.length;
    }
  }, [messages]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

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
